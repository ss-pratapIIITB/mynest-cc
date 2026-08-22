/**
 * Local-first persistence on IndexedDB.
 *
 * `localStorage` can't hold this: it caps around 5MB and stores strings only,
 * so image bytes would have to be base64'd into it. IndexedDB stores Blobs
 * natively and is effectively unbounded (subject to origin quota).
 *
 * Writes are *incremental*. Serialising the whole document on every change
 * would mean rewriting megabytes each time a stroke lands. Instead the flush
 * diffs the document against the last-written snapshot by object reference —
 * the store always produces new objects on write, so reference equality is an
 * exact and very cheap dirty check — and puts only what actually changed.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { BoardDoc, Camera, Element } from "./types";
import { emptyDoc } from "./types";
import type { AssetSource, Lod } from "./assets";

const DB_NAME = "mynest-board";
const DB_VERSION = 1;

const STORE_ELEMENTS = "elements";
const STORE_META = "meta";
const STORE_ASSETS = "assets";

/** Debounce for document flushes. Long enough to coalesce a burst of strokes. */
const FLUSH_MS = 600;

interface BoardMeta {
  boardId: string;
  version: 1;
  camera: Camera;
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_ELEMENTS)) {
          // Compound key [boardId, elementId] lets us range-scan one board.
          database.createObjectStore(STORE_ELEMENTS, {
            keyPath: ["boardId", "id"],
          });
        }
        if (!database.objectStoreNames.contains(STORE_META)) {
          database.createObjectStore(STORE_META, { keyPath: "boardId" });
        }
        if (!database.objectStoreNames.contains(STORE_ASSETS)) {
          database.createObjectStore(STORE_ASSETS);
        }
      },
    });
  }
  return dbPromise;
}

/** True when IndexedDB is usable (absent in SSR, blocked in some private modes). */
export function storageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/* ── document ── */

interface StoredElement extends Record<string, unknown> {
  boardId: string;
}

export async function loadBoard(boardId: string): Promise<BoardDoc> {
  const doc = emptyDoc();
  if (!storageAvailable()) return doc;

  try {
    const database = await db();
    const [rows, meta] = await Promise.all([
      database.getAll(
        STORE_ELEMENTS,
        IDBKeyRange.bound([boardId, ""], [boardId, "￿"]),
      ) as Promise<StoredElement[]>,
      database.get(STORE_META, boardId) as Promise<BoardMeta | undefined>,
    ]);

    for (const row of rows) {
      // Drop the partition key — it exists only to scope the IndexedDB range
      // scan and must not leak into the document or the share payload.
      const el: Record<string, unknown> = { ...row };
      delete el.boardId;
      doc.elements[el.id as string] = el as unknown as Element;
    }
    if (meta?.camera) doc.camera = meta.camera;
  } catch {
    // A corrupt or blocked database shouldn't stop the board from opening.
  }
  return doc;
}

/**
 * Incremental writer. Construct once per board, call `schedule()` whenever the
 * document changes, and `flush()` before unload.
 */
export class BoardPersister {
  /** Last-written element references, for the reference-equality diff. */
  private written = new Map<string, Element>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> = Promise.resolve();
  private disabled = !storageAvailable();

  constructor(
    private boardId: string,
    private getDoc: () => BoardDoc,
  ) {}

  /** Seed the diff baseline from a freshly loaded document (nothing dirty). */
  primeFrom(doc: BoardDoc) {
    this.written = new Map(Object.entries(doc.elements));
  }

  schedule() {
    if (this.disabled || this.timer !== null) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, FLUSH_MS);
  }

  async flush(): Promise<void> {
    if (this.disabled) return;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // Serialise flushes so two overlapping writes can't interleave.
    this.inFlight = this.inFlight.then(() => this.doFlush());
    return this.inFlight;
  }

  private async doFlush(): Promise<void> {
    const doc = this.getDoc();
    const elements = doc.elements;

    const puts: Element[] = [];
    for (const id in elements) {
      const el = elements[id];
      // Reference inequality means the store rewrote this element.
      if (this.written.get(id) !== el) puts.push(el);
    }
    const deletes: string[] = [];
    for (const id of this.written.keys()) {
      if (!(id in elements)) deletes.push(id);
    }

    try {
      const database = await db();
      const tx = database.transaction(
        [STORE_ELEMENTS, STORE_META],
        "readwrite",
      );
      const store = tx.objectStore(STORE_ELEMENTS);
      for (const el of puts) store.put({ ...el, boardId: this.boardId });
      for (const id of deletes) store.delete([this.boardId, id]);
      tx.objectStore(STORE_META).put({
        boardId: this.boardId,
        version: 1,
        camera: doc.camera,
        updatedAt: Date.now(),
      } satisfies BoardMeta);
      await tx.done;

      // Only adopt the new baseline once the transaction actually committed,
      // so a failed write is retried on the next flush rather than lost.
      for (const el of puts) this.written.set(el.id, el);
      for (const id of deletes) this.written.delete(id);
    } catch {
      // Quota exceeded or storage blocked. Keep the board usable in memory;
      // the next flush retries with the same dirty set.
    }
  }

  dispose() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
}

export async function clearBoard(boardId: string): Promise<void> {
  if (!storageAvailable()) return;
  const database = await db();
  const tx = database.transaction([STORE_ELEMENTS, STORE_META], "readwrite");
  await tx
    .objectStore(STORE_ELEMENTS)
    .delete(IDBKeyRange.bound([boardId, ""], [boardId, "￿"]));
  await tx.objectStore(STORE_META).delete(boardId);
  await tx.done;
}

/* ── assets ── */

function assetKey(assetId: string, lod: Lod) {
  return `${assetId}:${lod}`;
}

export async function putAsset(
  assetId: string,
  lod: Lod,
  blob: Blob,
): Promise<void> {
  if (!storageAvailable()) return;
  const database = await db();
  await database.put(STORE_ASSETS, blob, assetKey(assetId, lod));
}

export async function getAsset(
  assetId: string,
  lod: Lod,
): Promise<Blob | undefined> {
  if (!storageAvailable()) return undefined;
  const database = await db();
  return database.get(STORE_ASSETS, assetKey(assetId, lod));
}

/** Reads asset bytes out of IndexedDB. Used by the editable local board. */
export const localAssetSource: AssetSource = {
  async getBlob(assetId, lod) {
    try {
      return await getAsset(assetId, lod);
    } catch {
      return undefined;
    }
  },
};

/**
 * Reads asset bytes over HTTP. Used by the read-only shared board, where the
 * bytes live in blob storage rather than the visitor's browser.
 */
export function remoteAssetSource(baseUrl: string): AssetSource {
  return {
    async getBlob(assetId, lod) {
      try {
        const res = await fetch(`${baseUrl}/${assetId}-${lod}.webp`);
        if (!res.ok) return undefined;
        return await res.blob();
      } catch {
        return undefined;
      }
    },
  };
}
