/**
 * Image asset pipeline.
 *
 * Three rules drive the design:
 *
 * 1. Image bytes never live in the document. The document stores a content
 *    hash; bytes live in a separate store. A base64 data URI inside the JSON
 *    inflates it 33%, makes every save rewrite megabytes, and blocks parse.
 * 2. Downscale on the client, before anything is stored or uploaded. A 12MB
 *    phone photo becomes ~200KB. This is the single largest win available.
 * 3. Decoded bitmaps are cached with a hard memory budget. Decoded RGBA costs
 *    `w * h * 4` bytes — four 4000px images is ~256MB — so the cache evicts by
 *    real byte size, not by entry count.
 */

/** Longest edge of the stored "full size" asset. */
const FULL_MAX = 2048;
/** Longest edge of the thumbnail used when the image draws small on screen. */
const THUMB_MAX = 512;
/** Longest edge of the data-URI placeholder inlined into the document. */
const PLACEHOLDER_MAX = 24;

const WEBP_QUALITY = 0.82;
const THUMB_QUALITY = 0.7;

/** Decoded-bitmap cache budget. ~192MB of RGBA. */
const CACHE_BUDGET_BYTES = 192 * 1024 * 1024;

export type Lod = "thumb" | "full";

export interface PreparedImage {
  assetId: string;
  /** Stored bytes, one blob per level of detail. */
  full: Blob;
  thumb: Blob;
  /** Tiny data URI, small enough to sit in the document JSON. */
  placeholder: string;
  /** Dimensions of the stored full asset (post-downscale). */
  width: number;
  height: number;
}

/** Where asset bytes come from. IndexedDB locally, HTTP for a shared board. */
export interface AssetSource {
  getBlob(assetId: string, lod: Lod): Promise<Blob | undefined>;
}

/* ── encoding helpers ── */

function fitWithin(w: number, h: number, max: number) {
  const scale = Math.min(1, max / Math.max(w, h));
  return {
    w: Math.max(1, Math.round(w * scale)),
    h: Math.max(1, Math.round(h * scale)),
  };
}

/**
 * Draw `src` at `w x h` and encode. Prefers OffscreenCanvas (keeps the work
 * off the DOM); falls back to a detached <canvas> where convertToBlob is
 * missing.
 */
async function encodeResized(
  src: ImageBitmap,
  w: number,
  h: number,
  type: string,
  quality: number,
): Promise<Blob> {
  if (typeof OffscreenCanvas !== "undefined") {
    const off = new OffscreenCanvas(w, h);
    const ctx = off.getContext("2d");
    if (ctx && typeof off.convertToBlob === "function") {
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, 0, 0, w, h);
      return off.convertToBlob({ type, quality });
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
  if (!blob) throw new Error("image encode failed");
  return blob;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

async function sha256Hex(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Decode, downscale, re-encode, hash. The hash is taken over the *processed*
 * full-size bytes, so re-importing the same source file dedupes even if it
 * arrives with different metadata.
 */
export async function prepareImage(file: Blob): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const full = fitWithin(bitmap.width, bitmap.height, FULL_MAX);
    const thumb = fitWithin(bitmap.width, bitmap.height, THUMB_MAX);
    const ph = fitWithin(bitmap.width, bitmap.height, PLACEHOLDER_MAX);

    const [fullBlob, thumbBlob, phBlob] = await Promise.all([
      encodeResized(bitmap, full.w, full.h, "image/webp", WEBP_QUALITY),
      encodeResized(bitmap, thumb.w, thumb.h, "image/webp", THUMB_QUALITY),
      encodeResized(bitmap, ph.w, ph.h, "image/webp", 0.5),
    ]);

    return {
      assetId: await sha256Hex(fullBlob),
      full: fullBlob,
      thumb: thumbBlob,
      placeholder: await blobToDataUrl(phBlob),
      width: full.w,
      height: full.h,
    };
  } finally {
    bitmap.close();
  }
}

/* ── decoded bitmap cache ── */

interface CacheEntry {
  bitmap: ImageBitmap;
  bytes: number;
  lastUsed: number;
}

/**
 * LRU cache of decoded bitmaps, bounded by estimated RGBA bytes.
 *
 * `get` is synchronous and never blocks the render loop: a miss returns
 * undefined and schedules a decode, and the next frame picks up the result.
 * That's what keeps panning smooth while images stream in.
 */
export class BitmapCache {
  private entries = new Map<string, CacheEntry>();
  private pending = new Map<string, Promise<void>>();
  private failed = new Set<string>();
  private bytes = 0;
  private clock = 0;

  constructor(
    private source: AssetSource,
    /** Called when a decode lands, so the renderer can schedule a frame. */
    private onLoaded: () => void = () => {},
  ) {}

  setSource(source: AssetSource) {
    this.source = source;
    this.failed.clear();
  }

  private key(assetId: string, lod: Lod) {
    return `${assetId}:${lod}`;
  }

  /**
   * Decoded bitmap for this asset at this level of detail, or undefined if it
   * isn't resident yet. Never throws; a failed asset simply stays undefined.
   */
  get(assetId: string, lod: Lod): ImageBitmap | undefined {
    const key = this.key(assetId, lod);
    const hit = this.entries.get(key);
    if (hit) {
      hit.lastUsed = ++this.clock;
      return hit.bitmap;
    }
    this.request(assetId, lod);
    return undefined;
  }

  /** Best resident bitmap for this asset, preferring `lod`. */
  getBest(assetId: string, lod: Lod): ImageBitmap | undefined {
    const preferred = this.get(assetId, lod);
    if (preferred) return preferred;
    // Fall back to the other level so *something* paints while the preferred
    // one decodes — a thumbnail scaled up beats an empty rectangle.
    const other: Lod = lod === "full" ? "thumb" : "full";
    const entry = this.entries.get(this.key(assetId, other));
    if (entry) {
      entry.lastUsed = ++this.clock;
      return entry.bitmap;
    }
    return undefined;
  }

  private request(assetId: string, lod: Lod) {
    const key = this.key(assetId, lod);
    if (this.pending.has(key) || this.failed.has(key)) return;

    const job = (async () => {
      try {
        const blob = await this.source.getBlob(assetId, lod);
        if (!blob) {
          this.failed.add(key);
          return;
        }
        const bitmap = await createImageBitmap(blob);
        this.insert(key, bitmap);
        this.onLoaded();
      } catch {
        this.failed.add(key);
      } finally {
        this.pending.delete(key);
      }
    })();

    this.pending.set(key, job);
  }

  private insert(key: string, bitmap: ImageBitmap) {
    const existing = this.entries.get(key);
    if (existing) {
      existing.bitmap.close();
      this.bytes -= existing.bytes;
    }
    const bytes = bitmap.width * bitmap.height * 4;
    this.entries.set(key, { bitmap, bytes, lastUsed: ++this.clock });
    this.bytes += bytes;
    this.evict();
  }

  private evict() {
    if (this.bytes <= CACHE_BUDGET_BYTES) return;
    // Sort by recency and drop the coldest until back under budget.
    const cold = [...this.entries.entries()].sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed,
    );
    for (const [key, entry] of cold) {
      if (this.bytes <= CACHE_BUDGET_BYTES) break;
      entry.bitmap.close();
      this.bytes -= entry.bytes;
      this.entries.delete(key);
    }
  }

  /** Estimated resident bytes — surfaced in the debug HUD. */
  get residentBytes(): number {
    return this.bytes;
  }

  clear() {
    for (const entry of this.entries.values()) entry.bitmap.close();
    this.entries.clear();
    this.failed.clear();
    this.bytes = 0;
  }
}

/**
 * Which level of detail to draw, given how large the element is on screen.
 * Below the thumbnail's own resolution there is nothing to gain from the
 * full asset, and a lot of memory to lose.
 */
export function pickLod(screenWidthPx: number): Lod {
  return screenWidthPx > THUMB_MAX * 0.75 ? "full" : "thumb";
}
