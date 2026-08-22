/**
 * Publishing a board to a read-only link.
 *
 * The share id is generated on the *client*, before anything is uploaded.
 * That breaks a chicken-and-egg: assets need a path prefix to live under, and
 * the prefix has to be known before the document that references them exists.
 *
 * Image bytes go straight from the browser to blob storage via a short-lived
 * token. They never pass through the serverless function — which matters
 * because a request body there is capped around 4.5MB, and a board with a
 * dozen photos exceeds that comfortably.
 */

import { upload } from "@vercel/blob/client";
import type { BoardStore } from "./store";
import type { Lod } from "./assets";
import { getAsset } from "./persist";
import { estimateBytes, serializeDoc } from "./serialize";

/** Refuse to publish a document larger than this. */
const MAX_DOC_BYTES = 2 * 1024 * 1024;
const MAX_ASSETS = 60;

const ID_ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
export const SHARE_ID_RE = /^[a-hj-km-np-z2-9]{12}$/;

/** 12 chars from an unambiguous alphabet — no 0/o/1/l/i to misread aloud. */
function newShareId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

export function assetPath(shareId: string, assetId: string, lod: Lod): string {
  return `board/${shareId}/${assetId}-${lod}.webp`;
}

export function docPath(shareId: string): string {
  return `board/${shareId}/doc.json`;
}

/**
 * Upload assets and document, and return the public URL of the shared board.
 * Throws with a human-readable message on any refusal.
 */
export async function publishBoard(store: BoardStore): Promise<string> {
  if (store.size === 0) throw new Error("Nothing to publish yet.");

  const wire = serializeDoc(store.doc);
  const bytes = estimateBytes(wire);
  if (bytes > MAX_DOC_BYTES) {
    throw new Error(
      `Board is too large to publish (${(bytes / 1024 / 1024).toFixed(1)}MB of ${MAX_DOC_BYTES / 1024 / 1024}MB).`,
    );
  }

  const assetIds = store.assetIds();
  if (assetIds.length > MAX_ASSETS) {
    throw new Error(`Too many images to publish (limit ${MAX_ASSETS}).`);
  }

  const shareId = newShareId();

  // Assets first: the document must never reference bytes that aren't there.
  for (const assetId of assetIds) {
    for (const lod of ["thumb", "full"] as Lod[]) {
      const blob = await getAsset(assetId, lod);
      if (!blob) continue;
      await upload(assetPath(shareId, assetId, lod), blob, {
        access: "public",
        handleUploadUrl: "/api/board/upload",
        contentType: "image/webp",
      });
    }
  }

  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: shareId, doc: wire }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail.slice(0, 140) || `Publishing failed (${res.status}).`,
    );
  }

  return `${window.location.origin}/board/${shareId}`;
}
