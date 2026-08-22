/**
 * Issues short-lived tokens so the browser can PUT image bytes straight to
 * blob storage. Routing the bytes through this function instead would cap a
 * board at the ~4.5MB serverless request body limit.
 *
 * The token is deliberately narrow: WebP only, one size cap, and a pathname
 * that must sit under `board/<shareId>/`.
 */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { SHARE_ID_RE } from "@/lib/board/share";
import { blobConfigured, clientIp, rateLimit } from "@/lib/board/api-guard";

/** Matches the largest asset `prepareImage` can produce, with headroom. */
const MAX_ASSET_BYTES = 6 * 1024 * 1024;

const ASSET_PATH_RE = /^board\/([a-hj-km-np-z2-9]{12})\/([0-9a-f]{64})-(thumb|full)\.webp$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!blobConfigured()) {
    return NextResponse.json(
      { error: "Sharing is not configured on this deployment." },
      { status: 503 },
    );
  }
  if (rateLimit(clientIp(request))) {
    return NextResponse.json({ error: "Too many uploads." }, { status: 429 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const match = ASSET_PATH_RE.exec(pathname);
        if (!match || !SHARE_ID_RE.test(match[1])) {
          throw new Error("Invalid asset path.");
        }
        return {
          allowedContentTypes: ["image/webp"],
          maximumSizeInBytes: MAX_ASSET_BYTES,
          // Deterministic paths — the document references assets by content
          // hash, so the URL must be derivable from the hash alone.
          addRandomSuffix: false,
          // Assets are immutable: the name *is* the hash of the bytes.
          cacheControlMaxAge: 31536000,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to record — the document, uploaded next, is the index.
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload rejected." },
      { status: 400 },
    );
  }
}
