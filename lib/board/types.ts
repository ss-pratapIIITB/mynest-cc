/**
 * Board document model.
 *
 * Every element lives in unbounded *world* coordinates. The viewport is the
 * only finite thing — see camera.ts. Elements are stored in a flat map keyed
 * by id; paint order comes from `z`, a fractional index string (see order.ts)
 * so inserting between two neighbours never renumbers the document.
 */

export type Tool =
  | "select"
  | "pan"
  | "pen"
  | "rect"
  | "ellipse"
  | "text"
  | "eraser";

/** Axis-aligned bounding box in world space. */
export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface BaseElement {
  id: string;
  /** Fractional index — lexicographic sort gives paint order. */
  z: string;
  /** Cached world-space bounds. Kept in sync with geometry on every write. */
  box: Box;
}

export interface PenElement extends BaseElement {
  type: "pen";
  /** Flat [x, y, pressure, ...] triples in world space. Flat for compactness. */
  points: number[];
  color: string;
  size: number;
}

export interface RectElement extends BaseElement {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  fill: string | null;
  size: number;
}

export interface EllipseElement extends BaseElement {
  type: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  fill: string | null;
  size: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  /** Font size in world units. */
  size: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Content hash of the full-size asset. Bytes live outside the document. */
  assetId: string;
  /** Intrinsic pixel dimensions of the stored asset. */
  naturalW: number;
  naturalH: number;
  /**
   * Tiny (~24px) data-URI preview, inlined in the document so a freshly
   * loaded board paints something immediately without touching asset storage.
   */
  placeholder?: string;
}

export type Element =
  | PenElement
  | RectElement
  | EllipseElement
  | TextElement
  | ImageElement;

export type ElementType = Element["type"];

/** Camera. `z` is zoom: screen = (world - {x,y}) * z */
export interface Camera {
  x: number;
  y: number;
  z: number;
}

export interface BoardDoc {
  /** Schema version, so persisted documents can be migrated later. */
  version: 1;
  elements: Record<string, Element>;
  camera: Camera;
}

export function emptyDoc(): BoardDoc {
  return { version: 1, elements: {}, camera: { x: 0, y: 0, z: 1 } };
}
