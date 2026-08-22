/**
 * Stroke capture and simplification.
 *
 * Pointer hardware samples far faster than anyone needs to *store*. A 2-second
 * stroke at 240Hz is ~500 samples; simplified it is typically 30-60, visually
 * identical once perfect-freehand re-smooths it. That reduction compounds
 * across a document — it is the difference between a 4MB and a 400KB board.
 */

/** Perpendicular distance tolerance, in world units, for simplification. */
const DEFAULT_TOLERANCE = 0.6;
/** Minimum world distance between captured samples, to drop jitter. */
const MIN_SAMPLE_DIST = 0.35;

/**
 * Should this sample be kept? Called on every pointermove; rejecting
 * near-duplicates early keeps the live stroke buffer small.
 */
export function shouldSample(
  points: number[],
  x: number,
  y: number,
  minDist = MIN_SAMPLE_DIST,
): boolean {
  if (points.length < 3) return true;
  const lastX = points[points.length - 3];
  const lastY = points[points.length - 2];
  return (x - lastX) ** 2 + (y - lastY) ** 2 >= minDist * minDist;
}

function perpDistSq(
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
  if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
}

/**
 * Ramer–Douglas–Peucker over a flat [x, y, pressure, ...] buffer.
 *
 * Iterative rather than recursive: a long stroke on a slow device can produce
 * thousands of samples, and the recursive form can blow the stack.
 */
export function simplifyStroke(
  points: number[],
  tolerance = DEFAULT_TOLERANCE,
): number[] {
  const n = points.length / 3;
  if (n < 3) return points.slice();

  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  const tolSq = tolerance * tolerance;

  const stack: [number, number][] = [[0, n - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    if (last - first < 2) continue;

    const ax = points[first * 3];
    const ay = points[first * 3 + 1];
    const bx = points[last * 3];
    const by = points[last * 3 + 1];

    let maxDistSq = -1;
    let maxIndex = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpDistSq(points[i * 3], points[i * 3 + 1], ax, ay, bx, by);
      if (d > maxDistSq) {
        maxDistSq = d;
        maxIndex = i;
      }
    }

    if (maxDistSq > tolSq && maxIndex > 0) {
      keep[maxIndex] = 1;
      stack.push([first, maxIndex], [maxIndex, last]);
    }
  }

  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    if (keep[i]) {
      out.push(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
    }
  }
  return out;
}

/**
 * Round coordinates to two decimals before persisting. Sub-hundredth world
 * precision is invisible and costs ~15 bytes per point in JSON.
 */
export function quantizeStroke(points: number[]): number[] {
  const out = new Array<number>(points.length);
  for (let i = 0; i < points.length; i += 3) {
    out[i] = Math.round(points[i] * 100) / 100;
    out[i + 1] = Math.round(points[i + 1] * 100) / 100;
    out[i + 2] = Math.round(points[i + 2] * 1000) / 1000;
  }
  return out;
}
