/**
 * Camera math. The canvas is always viewport-sized; "infinite" comes entirely
 * from the fact that elements are stored in world space and only ever
 * projected through this transform.
 *
 *   screen = (world - camera) * zoom
 *   world  = screen / zoom + camera
 */

import type { Box, Camera } from "./types";

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 64;

export function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

export function worldToScreen(cam: Camera, wx: number, wy: number) {
  return { x: (wx - cam.x) * cam.z, y: (wy - cam.y) * cam.z };
}

export function screenToWorld(cam: Camera, sx: number, sy: number) {
  return { x: sx / cam.z + cam.x, y: sy / cam.z + cam.y };
}

/**
 * Zoom about a fixed screen point — the world coordinate under the cursor
 * must not move. Solve `sx / z1 + x1 = sx / z0 + x0` for the new origin.
 */
export function zoomAt(
  cam: Camera,
  sx: number,
  sy: number,
  factor: number,
): Camera {
  const z = clampZoom(cam.z * factor);
  if (z === cam.z) return cam;
  const wx = sx / cam.z + cam.x;
  const wy = sy / cam.z + cam.y;
  return { x: wx - sx / z, y: wy - sy / z, z };
}

/** The world-space rectangle currently visible, optionally padded in px. */
export function viewportBox(
  cam: Camera,
  width: number,
  height: number,
  padPx = 0,
): Box {
  const pad = padPx / cam.z;
  return {
    minX: cam.x - pad,
    minY: cam.y - pad,
    maxX: cam.x + width / cam.z + pad,
    maxY: cam.y + height / cam.z + pad,
  };
}

/** Camera that fits `box` into a viewport, with margin as a fraction of size. */
export function cameraForBox(
  box: Box,
  width: number,
  height: number,
  margin = 0.1,
): Camera {
  const bw = Math.max(1e-6, box.maxX - box.minX);
  const bh = Math.max(1e-6, box.maxY - box.minY);
  const z = clampZoom(
    Math.min(width / bw, height / bh) * (1 - Math.min(0.9, margin)),
  );
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  return { x: cx - width / 2 / z, y: cy - height / 2 / z, z };
}
