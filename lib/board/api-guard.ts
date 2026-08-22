/**
 * Shared guards for the board publish endpoints.
 *
 * The rate limiter is in-memory, matching the pattern already used by
 * /api/proxy. That means it is per-instance rather than global — enough to
 * blunt a single noisy client, not a substitute for a real limiter if this
 * ever gets sustained traffic.
 */

import type { NextRequest } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 40;

const buckets = new Map<string, { n: number; reset: number }>();

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(ip: string): boolean {
  const now = Date.now();

  // Opportunistic sweep so the map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [key, entry] of buckets) {
      if (now > entry.reset) buckets.delete(key);
    }
  }

  const entry = buckets.get(ip);
  if (!entry || now > entry.reset) {
    buckets.set(ip, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  if (entry.n >= MAX_REQUESTS) return true;
  entry.n++;
  return false;
}

/** Sharing degrades to "off" rather than erroring when no store is attached. */
export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
