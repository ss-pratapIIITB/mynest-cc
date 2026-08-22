/**
 * Fractional indexing for paint order.
 *
 * Z-order is a string compared lexicographically. To insert between two
 * elements you generate a key that sorts between their keys — no other
 * element is touched, so reordering costs O(1) writes instead of renumbering
 * the document. Same trick Figma and Linear use for ordering.
 *
 * Thin wrapper over `fractional-indexing` so call sites depend on our names.
 * Worth noting why the library rather than a plain base-36 fraction: keys
 * there carry an integer part, so repeated *appends* — the dominant operation
 * on a drawing board, since every new stroke goes on top — keep keys ~4 chars.
 * A fraction-only scheme grows them without bound (measured: 1000 chars after
 * 5000 appends).
 */

import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

/** A key that sorts strictly between `a` and `b`. Either may be null. */
export function between(a: string | null, b: string | null): string {
  return generateKeyBetween(a, b);
}

/** `n` keys in ascending order, all sorting between `a` and `b`. */
export function nBetween(
  a: string | null,
  b: string | null,
  n: number,
): string[] {
  return generateNKeysBetween(a, b, n);
}

/** Sort elements into paint order (back to front). */
export function byZ<T extends { z: string }>(items: T[]): T[] {
  return items.sort((p, q) => (p.z < q.z ? -1 : p.z > q.z ? 1 : 0));
}
