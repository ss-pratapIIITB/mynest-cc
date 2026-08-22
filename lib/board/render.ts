/**
 * Canvas renderer.
 *
 * Three ideas do all the work:
 *
 * 1. **Culling.** Every frame asks the spatial index for the elements whose
 *    bounds intersect the viewport and draws only those. A 50k-element
 *    document costs the same per frame as a 50-element one at equal zoom.
 *    This is why element count stops mattering.
 *
 * 2. **Layers.** The scene canvas holds committed elements and is redrawn
 *    only when the camera moves or the document changes. The overlay holds
 *    the in-flight stroke, selection chrome and marquee, and redraws freely.
 *    Ink latency therefore doesn't scale with document size.
 *
 * 3. **Level of detail.** Below a few screen pixels an element is drawn as a
 *    proxy — a bar instead of glyphs, a thumbnail instead of a 2048px bitmap.
 *    Zoomed out over a large board, most of what's visible is proxies.
 *
 * Path geometry is cached in a WeakMap keyed by the element object. The store
 * always writes a *new* object, so the cache invalidates itself exactly when
 * geometry changes, with no bookkeeping and no leak.
 */

import { getStroke } from "perfect-freehand";
import type { BoardStore } from "./store";
import type { Box, Camera, Element, ImageElement } from "./types";
import { viewportBox } from "./camera";
import { BitmapCache, pickLod } from "./assets";

export interface Theme {
  background: string;
  grid: string;
  /** Default ink colour, used when an element has no explicit colour. */
  ink: string;
  selection: string;
  selectionFill: string;
  proxy: string;
}

export const LIGHT_THEME: Theme = {
  background: "#fafafa",
  grid: "#d4d4d8",
  ink: "#111111",
  selection: "#7c3aed",
  selectionFill: "rgba(124, 58, 237, 0.08)",
  proxy: "#c4c4c8",
};

export const DARK_THEME: Theme = {
  background: "#080808",
  grid: "#27272a",
  ink: "#e2e2df",
  selection: "#8b5cf6",
  selectionFill: "rgba(139, 92, 246, 0.12)",
  proxy: "#3f3f46",
};

/** Below this on-screen size (px) an element is drawn as a proxy box. */
const PROXY_THRESHOLD_PX = 3;
/** Below this on-screen font size (px) text is drawn as bars. */
const TEXT_PROXY_PX = 6;

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", monospace';

/* ── stroke geometry cache ── */

const strokeCache = new WeakMap<Element, Path2D>();

/** Convert our flat [x, y, pressure, ...] buffer into perfect-freehand input. */
function toStrokePoints(points: number[]): number[][] {
  const out: number[][] = new Array(points.length / 3);
  for (let i = 0, j = 0; i < points.length; i += 3, j++) {
    out[j] = [points[i], points[i + 1], points[i + 2]];
  }
  return out;
}

/** True when the stroke carries genuine per-sample pressure (i.e. a stylus). */
function hasVaryingPressure(points: number[]): boolean {
  if (points.length < 6) return false;
  const first = points[2];
  for (let i = 5; i < points.length; i += 3) {
    if (Math.abs(points[i] - first) > 0.01) return true;
  }
  return false;
}

/**
 * Outline path for a pen stroke, in world coordinates. perfect-freehand turns
 * the sampled pointer path into a variable-width outline polygon; we fill that
 * rather than stroking a centreline, which is what gives ink its taper.
 */
export function strokePath(el: Element & { type: "pen" }): Path2D {
  const cached = strokeCache.get(el);
  if (cached) return cached;

  const outline = getStroke(toStrokePoints(el.points), {
    size: el.size,
    thinning: 0.55,
    smoothing: 0.4,
    // Streamline is a "lazy brush" pull towards the cursor. High values look
    // lovely on freehand curves but round off deliberate corners — a drawn
    // square comes out a leaf. Keep it low and let smoothing do the work.
    streamline: 0.18,
    // A mouse reports a constant 0.5, so real pressure data is only present
    // when a stylus drew the stroke. Simulate from velocity otherwise, rather
    // than rendering a dead uniform ribbon.
    simulatePressure: !hasVaryingPressure(el.points),
    last: true,
  });

  const path = new Path2D();
  if (outline.length > 0) {
    path.moveTo(outline[0][0], outline[0][1]);
    // Quadratic through segment midpoints — cheap and visually smooth.
    for (let i = 1; i < outline.length; i++) {
      const [x0, y0] = outline[i - 1];
      const [x1, y1] = outline[i];
      path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    path.closePath();
  }
  strokeCache.set(el, path);
  return path;
}

/* ── canvas sizing ── */

export interface Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

/**
 * Size the backing store to CSS pixels × devicePixelRatio and scale the
 * context to match. Skipping this is why hand-rolled canvases look blurry on
 * retina displays. Returns true if the backing store changed.
 */
export function resizeSurface(
  surface: Surface,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
): boolean {
  const w = Math.max(1, Math.round(cssWidth * dpr));
  const h = Math.max(1, Math.round(cssHeight * dpr));
  if (surface.canvas.width === w && surface.canvas.height === h) return false;
  surface.canvas.width = w;
  surface.canvas.height = h;
  surface.canvas.style.width = `${cssWidth}px`;
  surface.canvas.style.height = `${cssHeight}px`;
  return true;
}

/* ── drawing ── */

function applyCamera(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  dpr: number,
) {
  // Combined device-pixel and camera transform in one call.
  ctx.setTransform(
    cam.z * dpr,
    0,
    0,
    cam.z * dpr,
    -cam.x * cam.z * dpr,
    -cam.y * cam.z * dpr,
  );
}

/**
 * Dot grid. Spacing snaps to a power of two chosen so dots stay roughly
 * 24-48 screen pixels apart at any zoom — the grid densifies as you zoom in
 * instead of dissolving or turning into mush.
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  width: number,
  height: number,
  theme: Theme,
) {
  const TARGET_PX = 32;
  const worldStep = 2 ** Math.round(Math.log2(TARGET_PX / cam.z));
  const screenStep = worldStep * cam.z;
  if (screenStep < 6) return; // too dense to be useful

  const view = viewportBox(cam, width, height);
  const startX = Math.floor(view.minX / worldStep) * worldStep;
  const startY = Math.floor(view.minY / worldStep) * worldStep;
  const radius = screenStep > 64 ? 1.4 : 1;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = theme.grid;
  ctx.globalAlpha = 0.55;
  for (let wx = startX; wx <= view.maxX; wx += worldStep) {
    const sx = (wx - cam.x) * cam.z;
    for (let wy = startY; wy <= view.maxY; wy += worldStep) {
      const sy = (wy - cam.y) * cam.z;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Placeholder bitmaps decoded from the tiny data URI inlined in the doc. */
const placeholderCache = new Map<string, ImageBitmap | "pending" | "failed">();

function placeholderBitmap(
  el: ImageElement,
  onLoaded: () => void,
): ImageBitmap | undefined {
  if (!el.placeholder) return undefined;
  const cached = placeholderCache.get(el.assetId);
  if (cached instanceof ImageBitmap) return cached;
  if (cached) return undefined; // pending or failed

  placeholderCache.set(el.assetId, "pending");
  void (async () => {
    try {
      const res = await fetch(el.placeholder!);
      const bitmap = await createImageBitmap(await res.blob());
      placeholderCache.set(el.assetId, bitmap);
      onLoaded();
    } catch {
      placeholderCache.set(el.assetId, "failed");
    }
  })();
  return undefined;
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  el: Element,
  cam: Camera,
  theme: Theme,
  bitmaps: BitmapCache,
  onAssetLoaded: () => void,
) {
  const screenW = (el.box.maxX - el.box.minX) * cam.z;
  const screenH = (el.box.maxY - el.box.minY) * cam.z;

  // Level of detail: too small to read, so draw a proxy and move on.
  if (Math.max(screenW, screenH) < PROXY_THRESHOLD_PX) {
    ctx.fillStyle = theme.proxy;
    ctx.fillRect(
      el.box.minX,
      el.box.minY,
      el.box.maxX - el.box.minX,
      el.box.maxY - el.box.minY,
    );
    return;
  }

  switch (el.type) {
    case "pen": {
      ctx.fillStyle = el.color;
      ctx.fill(strokePath(el));
      break;
    }

    case "rect": {
      const x = Math.min(el.x, el.x + el.w);
      const y = Math.min(el.y, el.y + el.h);
      const w = Math.abs(el.w);
      const h = Math.abs(el.h);
      if (el.fill) {
        ctx.fillStyle = el.fill;
        ctx.fillRect(x, y, w, h);
      }
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.size;
      ctx.lineJoin = "round";
      ctx.strokeRect(x, y, w, h);
      break;
    }

    case "ellipse": {
      const rx = Math.abs(el.w) / 2;
      const ry = Math.abs(el.h) / 2;
      const cx = Math.min(el.x, el.x + el.w) + rx;
      const cy = Math.min(el.y, el.y + el.h) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      if (el.fill) {
        ctx.fillStyle = el.fill;
        ctx.fill();
      }
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.size;
      ctx.stroke();
      break;
    }

    case "text": {
      const lines = el.text.split("\n");
      const lineHeight = el.size * 1.3;
      if (el.size * cam.z < TEXT_PROXY_PX) {
        // Too small to read — bars preserve the block's shape for far less
        // cost than laying out and rasterising glyphs.
        ctx.fillStyle = theme.proxy;
        lines.forEach((line, i) => {
          if (!line) return;
          ctx.fillRect(
            el.x,
            el.y + i * lineHeight + el.size * 0.25,
            line.length * el.size * 0.55,
            el.size * 0.62,
          );
        });
        break;
      }
      ctx.fillStyle = el.color;
      ctx.font = `${el.size}px ${FONT_STACK}`;
      ctx.textBaseline = "top";
      lines.forEach((line, i) => ctx.fillText(line, el.x, el.y + i * lineHeight));
      break;
    }

    case "image": {
      const bitmap = bitmaps.getBest(el.assetId, pickLod(screenW));
      if (bitmap) {
        ctx.drawImage(bitmap, el.x, el.y, el.w, el.h);
        break;
      }
      const ph = placeholderBitmap(el, onAssetLoaded);
      if (ph) {
        // Blurred-up 24px preview: something recognisable lands immediately,
        // before any real asset bytes have been fetched.
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(ph, el.x, el.y, el.w, el.h);
        break;
      }
      ctx.fillStyle = theme.proxy;
      ctx.fillRect(el.x, el.y, el.w, el.h);
      break;
    }
  }
}

export interface SceneStats {
  visible: number;
  total: number;
  drawMs: number;
}

/** Redraw the committed scene: background, grid, culled elements. */
export function drawScene(
  surface: Surface,
  store: BoardStore,
  theme: Theme,
  bitmaps: BitmapCache,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  onAssetLoaded: () => void,
): SceneStats {
  const t0 = performance.now();
  const { ctx } = surface;
  const cam = store.camera;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, surface.canvas.width, surface.canvas.height);
  ctx.scale(dpr, dpr);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  drawGrid(ctx, cam, cssWidth, cssHeight, theme);

  // The one query that makes document size irrelevant. A small pad keeps
  // elements straddling the edge from popping in.
  const view = viewportBox(cam, cssWidth, cssHeight, 64);
  const visible = store.query(view);

  applyCamera(ctx, cam, dpr);
  for (const el of visible) {
    drawElement(ctx, el, cam, theme, bitmaps, onAssetLoaded);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  return {
    visible: visible.length,
    total: store.size,
    drawMs: performance.now() - t0,
  };
}

export interface OverlayState {
  /** Stroke or shape being drawn right now — never in the store until commit. */
  draft: Element | null;
  /** Marquee rectangle in world space. */
  marquee: Box | null;
  /** Bounds of the current selection, in world space. */
  selectionBox: Box | null;
  /** Individual selected element boxes, drawn faintly. */
  selectedBoxes: Box[];
}

/** Redraw the interaction layer. Independent of document size. */
export function drawOverlay(
  surface: Surface,
  cam: Camera,
  state: OverlayState,
  theme: Theme,
  bitmaps: BitmapCache,
  dpr: number,
  onAssetLoaded: () => void,
) {
  const { ctx } = surface;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, surface.canvas.width, surface.canvas.height);

  applyCamera(ctx, cam, dpr);

  if (state.draft) {
    drawElement(ctx, state.draft, cam, theme, bitmaps, onAssetLoaded);
  }

  // Chrome is drawn in screen space so line weights stay crisp at any zoom.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const toScreen = (b: Box) => ({
    x: (b.minX - cam.x) * cam.z,
    y: (b.minY - cam.y) * cam.z,
    w: (b.maxX - b.minX) * cam.z,
    h: (b.maxY - b.minY) * cam.z,
  });

  if (state.selectedBoxes.length > 1) {
    ctx.strokeStyle = theme.selection;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    for (const b of state.selectedBoxes) {
      const r = toScreen(b);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    ctx.globalAlpha = 1;
  }

  if (state.selectionBox) {
    const r = toScreen(state.selectionBox);
    const pad = 4;
    ctx.strokeStyle = theme.selection;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2);

    // Corner handles.
    const s = 6;
    ctx.fillStyle = theme.selection;
    for (const [hx, hy] of [
      [r.x - pad, r.y - pad],
      [r.x + r.w + pad, r.y - pad],
      [r.x - pad, r.y + r.h + pad],
      [r.x + r.w + pad, r.y + r.h + pad],
    ]) {
      ctx.fillRect(hx - s / 2, hy - s / 2, s, s);
    }
  }

  if (state.marquee) {
    const r = toScreen(state.marquee);
    ctx.fillStyle = theme.selectionFill;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = theme.selection;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
