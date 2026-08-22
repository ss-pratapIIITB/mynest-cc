/**
 * Publishes a board document. Assets were already uploaded client-side under
 * the same share id; this writes the document that indexes them.
 *
 * The document is small (capped at 2MB) so it goes through the function
 * rather than needing a client token like the images do.
 */

import { head, put } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";
import { SHARE_ID_RE, docPath } from "@/lib/board/share";
import { blobConfigured, clientIp, rateLimit } from "@/lib/board/api-guard";

const MAX_DOC_BYTES = 2 * 1024 * 1024;
const MAX_ELEMENTS = 50_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!blobConfigured()) {
    return NextResponse.json(
      { error: "Sharing is not configured on this deployment." },
      { status: 503 },
    );
  }
  if (rateLimit(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many boards published. Try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { id, doc } = (body ?? {}) as { id?: unknown; doc?: unknown };

  if (typeof id !== "string" || !SHARE_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }
  if (!doc || typeof doc !== "object") {
    return NextResponse.json({ error: "Missing document." }, { status: 400 });
  }

  const elements = (doc as { elements?: unknown }).elements;
  if (!Array.isArray(elements) || elements.length === 0) {
    return NextResponse.json({ error: "Empty document." }, { status: 400 });
  }
  if (elements.length > MAX_ELEMENTS) {
    return NextResponse.json({ error: "Document too large." }, { status: 413 });
  }

  const payload = JSON.stringify(doc);
  if (payload.length > MAX_DOC_BYTES) {
    return NextResponse.json({ error: "Document too large." }, { status: 413 });
  }

  const pathname = docPath(id);

  // Ids are client-generated, so refuse to overwrite one that already exists
  // rather than letting a collision silently replace someone's board.
  try {
    await head(pathname);
    return NextResponse.json(
      { error: "Board id already taken." },
      { status: 409 },
    );
  } catch {
    // Not found is the expected path.
  }

  try {
    const blob = await put(pathname, payload, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      // Published boards are immutable; a new edit publishes a new id.
      cacheControlMaxAge: 31536000,
    });
    return NextResponse.json({ id, url: blob.url });
  } catch {
    return NextResponse.json(
      { error: "Could not publish board." },
      { status: 502 },
    );
  }
}
