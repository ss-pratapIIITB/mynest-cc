/**
 * Board document store.
 *
 * Deliberately *not* React state. The camera moves at 60Hz and strokes append
 * points at pointer rate; routing that through `useState` would re-render the
 * tree on every frame. Instead this is a plain observable object that the
 * renderer reads imperatively, and React subscribes only to the coarse
 * "something changed" signal it needs for toolbar/undo affordances.
 *
 * The spatial index is the reason 1000s of elements stay cheap: every render
 * and every hit test queries an R-tree by viewport rather than walking the
 * document.
 */

import RBush from "rbush";
import type { BoardDoc, Box, Camera, Element } from "./types";
import { emptyDoc } from "./types";
import { computeBox } from "./geometry";
import { between, byZ } from "./order";

interface IndexItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
}

/** One element's before/after state. `null` means absent. */
interface Patch {
  id: string;
  before: Element | null;
  after: Element | null;
}

export type ChangeReason = "edit" | "undo" | "redo" | "load" | "selection";

const MAX_HISTORY = 200;

export class BoardStore {
  doc: BoardDoc = emptyDoc();
  selection = new Set<string>();

  private tree = new RBush<IndexItem>();
  /** id -> the exact index item, so removal is a reference delete not a scan. */
  private items = new Map<string, IndexItem>();

  private undoStack: Patch[][] = [];
  private redoStack: Patch[][] = [];
  /** Patches accumulated since the outermost `beginBatch`. */
  private batch: Patch[] | null = null;
  /** Nesting depth, so an inner endBatch doesn't flush the outer entry. */
  private batchDepth = 0;

  /**
   * Cached z extremes. `null` means dirty — recomputed lazily, because the
   * only way to invalidate is to delete whichever element held the extreme.
   * Without this, every new stroke would walk the whole document.
   */
  private zMax: string | null = null;
  private zMin: string | null = null;

  private listeners = new Set<(reason: ChangeReason) => void>();
  /** Bumped on every mutation so the renderer knows to re-bake its layers. */
  revision = 0;

  /* ── subscription ── */

  subscribe(fn: (reason: ChangeReason) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(reason: ChangeReason) {
    if (reason !== "selection") this.revision++;
    for (const fn of this.listeners) fn(reason);
  }

  /* ── document lifecycle ── */

  load(doc: BoardDoc) {
    this.doc = doc;
    this.selection.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.batch = null;
    this.reindex();
    this.emit("load");
  }

  private reindex() {
    this.tree.clear();
    this.items.clear();
    const bulk: IndexItem[] = [];
    for (const el of Object.values(this.doc.elements)) {
      const item = { ...el.box, id: el.id };
      this.items.set(el.id, item);
      bulk.push(item);
    }
    // Bulk load builds a far better-balanced tree than n inserts.
    this.tree.load(bulk);
    this.zMax = null;
    this.zMin = null;
  }

  get camera(): Camera {
    return this.doc.camera;
  }

  /** Camera changes bypass the listener path — the renderer polls it. */
  setCamera(cam: Camera) {
    this.doc.camera = cam;
  }

  /* ── queries ── */

  get(id: string): Element | undefined {
    return this.doc.elements[id];
  }

  get size(): number {
    return this.items.size;
  }

  /** Elements whose bounds intersect `box`, in paint order. */
  query(box: Box): Element[] {
    const hits = this.tree.search(box);
    const out: Element[] = [];
    for (const h of hits) {
      const el = this.doc.elements[h.id];
      if (el) out.push(el);
    }
    return byZ(out);
  }

  /** Same as `query` but front-to-back, for hit testing. */
  queryReverse(box: Box): Element[] {
    return this.query(box).reverse();
  }

  /** Bounds of every element, for zoom-to-fit. */
  bounds(): Box | null {
    if (this.items.size === 0) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const it of this.items.values()) {
      if (it.minX < minX) minX = it.minX;
      if (it.minY < minY) minY = it.minY;
      if (it.maxX > maxX) maxX = it.maxX;
      if (it.maxY > maxY) maxY = it.maxY;
    }
    return { minX, minY, maxX, maxY };
  }

  private recomputeZExtremes() {
    let lo: string | null = null;
    let hi: string | null = null;
    for (const el of Object.values(this.doc.elements)) {
      if (lo === null || el.z < lo) lo = el.z;
      if (hi === null || el.z > hi) hi = el.z;
    }
    this.zMin = lo;
    this.zMax = hi;
  }

  /** The z key that sorts above everything — for appending a new element. */
  topZ(): string {
    if (this.zMax === null && this.items.size > 0) this.recomputeZExtremes();
    return between(this.zMax, null);
  }

  bottomZ(): string {
    if (this.zMin === null && this.items.size > 0) this.recomputeZExtremes();
    return between(null, this.zMin);
  }

  /* ── mutation ── */

  /**
   * Group everything until `endBatch` into one undo entry. Nesting is
   * refcounted-by-ignoring: an inner begin is a no-op, so a drag that calls
   * helpers which also batch still produces exactly one history entry.
   */
  beginBatch() {
    if (this.batchDepth === 0) this.batch = [];
    this.batchDepth++;
  }

  endBatch() {
    if (this.batchDepth === 0) return;
    this.batchDepth--;
    if (this.batchDepth > 0) return; // inner scope — keep accumulating
    const batch = this.batch;
    this.batch = null;
    if (!batch || batch.length === 0) return;
    this.undoStack.push(batch);
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack = [];
    this.emit("edit");
  }

  /** Discard an in-flight batch's undo entry without reverting (e.g. no-op drag). */
  cancelBatch() {
    this.batch = null;
    this.batchDepth = 0;
  }

  private record(patch: Patch) {
    if (this.batch) {
      this.batch.push(patch);
    } else {
      this.undoStack.push([patch]);
      if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
      this.redoStack = [];
    }
  }

  /** Apply an element write to the document and index, without history. */
  private write(id: string, next: Element | null) {
    const prevItem = this.items.get(id);
    if (prevItem) {
      this.tree.remove(prevItem);
      this.items.delete(id);
    }
    const prev = this.doc.elements[id];
    if (next === null) {
      delete this.doc.elements[id];
    } else {
      this.doc.elements[id] = next;
      const item = { ...next.box, id };
      this.items.set(id, item);
      this.tree.insert(item);
    }

    // Maintain the cached z extremes. Growing is exact; losing the element
    // that *held* an extreme marks it dirty for a lazy recompute.
    if (next !== null) {
      if (this.zMax !== null && next.z > this.zMax) this.zMax = next.z;
      if (this.zMin !== null && next.z < this.zMin) this.zMin = next.z;
    }
    if (prev && prev.z !== next?.z) {
      if (prev.z === this.zMax) this.zMax = null;
      if (prev.z === this.zMin) this.zMin = null;
    }
    if (this.items.size === 0) {
      this.zMax = null;
      this.zMin = null;
    }
  }

  add(el: Element) {
    const next = { ...el, box: computeBox(el) };
    this.write(el.id, next);
    this.record({ id: el.id, before: null, after: next });
    if (!this.batch) this.emit("edit");
  }

  /**
   * Replace an element. `mutator` receives the current element and returns the
   * next one; box is recomputed automatically.
   */
  update(id: string, mutator: (el: Element) => Element) {
    const before = this.doc.elements[id];
    if (!before) return;
    const draft = mutator(before);
    const after = { ...draft, box: computeBox(draft) };
    this.write(id, after);
    this.record({ id, before, after });
    if (!this.batch) this.emit("edit");
  }

  /**
   * Fast path for in-progress strokes: updates the document and index but
   * records *no* history. The caller records one patch when the stroke ends.
   */
  updateLive(id: string, mutator: (el: Element) => Element) {
    const before = this.doc.elements[id];
    if (!before) return;
    const draft = mutator(before);
    this.write(id, { ...draft, box: computeBox(draft) });
    this.revision++;
  }

  /**
   * Turn a run of `updateLive` writes into a single undo entry.
   *
   * Drags and resizes update elements every frame; recording each frame would
   * flood the history. Instead the caller snapshots the originals at gesture
   * start, mutates live, and calls this once at the end.
   */
  commitLive(originals: Map<string, Element>) {
    const patches: Patch[] = [];
    for (const [id, before] of originals) {
      const after = this.doc.elements[id] ?? null;
      if (after === before) continue;
      patches.push({ id, before, after });
    }
    if (patches.length === 0) return;
    this.undoStack.push(patches);
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack = [];
    this.emit("edit");
  }

  remove(id: string) {
    const before = this.doc.elements[id];
    if (!before) return;
    this.write(id, null);
    this.record({ id, before, after: null });
    this.selection.delete(id);
    if (!this.batch) this.emit("edit");
  }

  removeMany(ids: Iterable<string>) {
    this.beginBatch();
    for (const id of ids) this.remove(id);
    this.endBatch();
  }

  /* ── history ── */

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo() {
    const batch = this.undoStack.pop();
    if (!batch) return;
    // Reverse order so interdependent writes unwind correctly.
    for (let i = batch.length - 1; i >= 0; i--) {
      const p = batch[i];
      this.write(p.id, p.before);
      if (p.before === null) this.selection.delete(p.id);
    }
    this.redoStack.push(batch);
    this.emit("undo");
  }

  redo() {
    const batch = this.redoStack.pop();
    if (!batch) return;
    for (const p of batch) {
      this.write(p.id, p.after);
      if (p.after === null) this.selection.delete(p.id);
    }
    this.undoStack.push(batch);
    this.emit("redo");
  }

  /* ── selection ── */

  setSelection(ids: Iterable<string>) {
    this.selection = new Set(ids);
    this.emit("selection");
  }

  clearSelection() {
    if (this.selection.size === 0) return;
    this.selection.clear();
    this.emit("selection");
  }

  selectionBounds(): Box | null {
    let box: Box | null = null;
    for (const id of this.selection) {
      const el = this.doc.elements[id];
      if (!el) continue;
      box = box
        ? {
            minX: Math.min(box.minX, el.box.minX),
            minY: Math.min(box.minY, el.box.minY),
            maxX: Math.max(box.maxX, el.box.maxX),
            maxY: Math.max(box.maxY, el.box.maxY),
          }
        : { ...el.box };
    }
    return box;
  }

  /** Elements fully inside `box` — marquee selection. */
  selectInBox(box: Box): string[] {
    return this.tree
      .search(box)
      .filter(
        (it) =>
          it.minX >= box.minX &&
          it.minY >= box.minY &&
          it.maxX <= box.maxX &&
          it.maxY <= box.maxY,
      )
      .map((it) => it.id);
  }

  /** Every distinct asset id referenced by the document. */
  assetIds(): string[] {
    const out = new Set<string>();
    for (const el of Object.values(this.doc.elements)) {
      if (el.type === "image") out.add(el.assetId);
    }
    return [...out];
  }
}
