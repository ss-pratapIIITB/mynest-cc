/**
 * Wire format for a board document.
 *
 * Two things are stripped before a document goes over the network:
 *
 * - `box` on every element. It is derivable from the geometry, so shipping it
 *   is pure waste. Measured at ~11% of a stroke-heavy document (where point
 *   arrays dominate) and proportionally more of a shape- or text-heavy one.
 * - `placeholder` is *kept*, deliberately. It is the one thing that lets a
 *   freshly opened shared board paint recognisable content before a single
 *   asset request completes.
 *
 * Bounds are recomputed on load, which costs one pass over the elements —
 * far cheaper than transferring them.
 */

import type { BoardDoc, Element } from "./types";
import { emptyDoc } from "./types";
import { computeBox } from "./geometry";

/** Elements minus their derived bounds. */
type WireElement = Omit<Element, "box">;

export interface WireDoc {
  version: 1;
  camera: BoardDoc["camera"];
  elements: WireElement[];
}

export function serializeDoc(doc: BoardDoc): WireDoc {
  const elements: WireElement[] = [];
  for (const id in doc.elements) {
    const el: Record<string, unknown> = { ...doc.elements[id] };
    delete el.box;
    elements.push(el as unknown as WireElement);
  }
  return { version: 1, camera: doc.camera, elements };
}

/**
 * Rebuild a document from the wire format. Unknown element types are dropped
 * rather than throwing, so a board written by a newer version still opens.
 */
export function deserializeDoc(wire: unknown): BoardDoc {
  const doc = emptyDoc();
  if (!wire || typeof wire !== "object") return doc;

  const w = wire as Partial<WireDoc>;
  if (
    w.camera &&
    Number.isFinite(w.camera.x) &&
    Number.isFinite(w.camera.y) &&
    Number.isFinite(w.camera.z) &&
    w.camera.z > 0
  ) {
    doc.camera = { x: w.camera.x, y: w.camera.y, z: w.camera.z };
  }

  const known = new Set(["pen", "rect", "ellipse", "text", "image"]);
  for (const raw of Array.isArray(w.elements) ? w.elements : []) {
    if (
      !raw ||
      typeof raw !== "object" ||
      typeof (raw as WireElement).id !== "string" ||
      typeof (raw as WireElement).z !== "string" ||
      !known.has((raw as WireElement).type)
    ) {
      continue;
    }
    const el = { ...(raw as WireElement) } as Element;
    el.box = computeBox(el);
    doc.elements[el.id] = el;
  }
  return doc;
}

/** Rough serialized size, used to enforce the publish cap before uploading. */
export function estimateBytes(wire: WireDoc): number {
  return new Blob([JSON.stringify(wire)]).size;
}
