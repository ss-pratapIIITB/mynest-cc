/**
 * Bounds and hit-testing in world space.
 *
 * Hit-testing is two-phase: the store's spatial index does the broad phase
 * (which elements' boxes contain the point), and these functions do the
 * narrow phase on the handful that survive.
 */

import type { Box, Element } from "./types";

export const EMPTY_BOX: Box = {
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
};

export function boxesIntersect(a: Box, b: Box): boolean {
  return (
    a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
  );
}

export function boxContains(outer: Box, inner: Box): boolean {
  return (
    outer.minX <= inner.minX &&
    outer.minY <= inner.minY &&
    outer.maxX >= inner.maxX &&
    outer.maxY >= inner.maxY
  );
}

export function unionBox(a: Box, b: Box): Box {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

export function unionAll(boxes: Box[]): Box {
  return boxes.reduce(unionBox, EMPTY_BOX);
}

export function padBox(b: Box, pad: number): Box {
  return {
    minX: b.minX - pad,
    minY: b.minY - pad,
    maxX: b.maxX + pad,
    maxY: b.maxY + pad,
  };
}

export function isEmptyBox(b: Box): boolean {
  return !(b.maxX >= b.minX && b.maxY >= b.minY);
}

/**
 * World bounds of an element. Pen strokes include half the stroke width so
 * the box covers the rendered outline, not just the centreline.
 */
export function computeBox(el: Element): Box {
  switch (el.type) {
    case "pen": {
      const pad = el.size / 2 + 1;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (let i = 0; i < el.points.length; i += 3) {
        const x = el.points[i];
        const y = el.points[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      if (minX === Infinity) return EMPTY_BOX;
      return {
        minX: minX - pad,
        minY: minY - pad,
        maxX: maxX + pad,
        maxY: maxY + pad,
      };
    }
    case "rect":
    case "ellipse": {
      const pad = el.size / 2 + 1;
      const x0 = Math.min(el.x, el.x + el.w);
      const y0 = Math.min(el.y, el.y + el.h);
      return {
        minX: x0 - pad,
        minY: y0 - pad,
        maxX: x0 + Math.abs(el.w) + pad,
        maxY: y0 + Math.abs(el.h) + pad,
      };
    }
    case "image":
      return {
        minX: el.x,
        minY: el.y,
        maxX: el.x + el.w,
        maxY: el.y + el.h,
      };
    case "text": {
      // Approximation — the renderer measures precisely and calls back with
      // the real width. Good enough for the index until then.
      const lines = el.text.split("\n");
      const cols = Math.max(1, ...lines.map((l) => l.length));
      return {
        minX: el.x,
        minY: el.y,
        maxX: el.x + cols * el.size * 0.6,
        maxY: el.y + lines.length * el.size * 1.3,
      };
    }
  }
}

/** Squared distance from a point to a segment. Avoids a sqrt in the loop. */
function distSqToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return (px - cx) ** 2 + (py - cy) ** 2;
}

/**
 * Narrow-phase hit test. `tolerance` is in world units and should be scaled
 * by the caller as `screenTolerance / camera.z` so the grab area stays
 * constant in screen pixels at any zoom.
 */
export function hitTest(
  el: Element,
  px: number,
  py: number,
  tolerance: number,
): boolean {
  switch (el.type) {
    case "pen": {
      const r = el.size / 2 + tolerance;
      const rSq = r * r;
      const pts = el.points;
      if (pts.length === 3) {
        return (px - pts[0]) ** 2 + (py - pts[1]) ** 2 <= rSq;
      }
      for (let i = 0; i + 5 < pts.length; i += 3) {
        if (
          distSqToSegment(px, py, pts[i], pts[i + 1], pts[i + 3], pts[i + 4]) <=
          rSq
        ) {
          return true;
        }
      }
      return false;
    }
    case "rect": {
      const x0 = Math.min(el.x, el.x + el.w);
      const y0 = Math.min(el.y, el.y + el.h);
      const x1 = x0 + Math.abs(el.w);
      const y1 = y0 + Math.abs(el.h);
      const t = el.size / 2 + tolerance;
      const inOuter =
        px >= x0 - t && px <= x1 + t && py >= y0 - t && py <= y1 + t;
      if (!inOuter) return false;
      if (el.fill) return true; // filled: anywhere inside counts
      const inInner =
        px > x0 + t && px < x1 - t && py > y0 + t && py < y1 - t;
      return !inInner; // hollow: only the border counts
    }
    case "ellipse": {
      const rx = Math.abs(el.w) / 2;
      const ry = Math.abs(el.h) / 2;
      if (rx < 1e-6 || ry < 1e-6) return false;
      const cx = Math.min(el.x, el.x + el.w) + rx;
      const cy = Math.min(el.y, el.y + el.h) + ry;
      const t = el.size / 2 + tolerance;
      const outer =
        ((px - cx) / (rx + t)) ** 2 + ((py - cy) / (ry + t)) ** 2 <= 1;
      if (!outer) return false;
      if (el.fill) return true;
      const inner =
        rx > t &&
        ry > t &&
        ((px - cx) / (rx - t)) ** 2 + ((py - cy) / (ry - t)) ** 2 < 1;
      return !inner;
    }
    case "text":
    case "image": {
      const b = computeBox(el);
      return (
        px >= b.minX - tolerance &&
        px <= b.maxX + tolerance &&
        py >= b.minY - tolerance &&
        py <= b.maxY + tolerance
      );
    }
  }
}

/**
 * Scale an element about the fixed point (`ox`, `oy`). Stroke widths and font
 * sizes scale with the geometry, so a resized drawing keeps its proportions
 * rather than growing spindly.
 */
export function scaleElement<T extends Element>(
  el: T,
  ox: number,
  oy: number,
  sx: number,
  sy: number,
): T {
  const at = (v: number, o: number, s: number) => o + (v - o) * s;
  // Line weight and type size have no axis, so they follow the mean scale.
  const meanScale = (Math.abs(sx) + Math.abs(sy)) / 2;
  let next: Element;

  if (el.type === "pen") {
    const points = el.points.slice();
    for (let i = 0; i < points.length; i += 3) {
      points[i] = at(points[i], ox, sx);
      points[i + 1] = at(points[i + 1], oy, sy);
    }
    next = { ...el, points, size: Math.max(0.5, el.size * meanScale) };
  } else if (el.type === "text") {
    next = {
      ...el,
      x: at(el.x, ox, sx),
      y: at(el.y, oy, sy),
      size: Math.max(1, el.size * meanScale),
    };
  } else if (el.type === "image") {
    next = {
      ...el,
      x: at(el.x, ox, sx),
      y: at(el.y, oy, sy),
      w: el.w * sx,
      h: el.h * sy,
    };
  } else {
    next = {
      ...el,
      x: at(el.x, ox, sx),
      y: at(el.y, oy, sy),
      w: el.w * sx,
      h: el.h * sy,
      size: Math.max(0.5, el.size * meanScale),
    };
  }

  next.box = computeBox(next);
  return next as T;
}

/** Translate an element in place-ish (returns a new object). */
export function translateElement<T extends Element>(el: T, dx: number, dy: number): T {
  let next: Element;
  if (el.type === "pen") {
    const points = el.points.slice();
    for (let i = 0; i < points.length; i += 3) {
      points[i] += dx;
      points[i + 1] += dy;
    }
    next = { ...el, points };
  } else {
    next = { ...el, x: el.x + dx, y: el.y + dy };
  }
  next.box = computeBox(next);
  return next as T;
}
