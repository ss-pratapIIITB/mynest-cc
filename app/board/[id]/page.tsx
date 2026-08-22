import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { head } from "@vercel/blob";
import SharedBoard from "@/components/board/shared-board";
import { SHARE_ID_RE, docPath } from "@/lib/board/share";
import { blobConfigured } from "@/lib/board/api-guard";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Shared board — mynest.cc",
  description: "A published board from mynest.cc.",
  // Published boards are unlisted: anyone with the link can view, but they
  // shouldn't turn up in search results.
  robots: { index: false, follow: false },
};

/**
 * Fetch a published document. Returns null for anything missing or malformed
 * so the route can 404 rather than surface storage errors to the visitor.
 */
async function loadShared(id: string) {
  if (!blobConfigured() || !SHARE_ID_RE.test(id)) return null;
  try {
    const blob = await head(docPath(id));
    const res = await fetch(blob.url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return {
      wireDoc: await res.json(),
      // Assets sit beside the document under the same share prefix.
      assetBase: blob.url.replace(/\/doc\.json$/, ""),
    };
  } catch {
    return null;
  }
}

export default async function SharedBoardPage({ params }: Props) {
  const { id } = await params;
  const shared = await loadShared(id);
  if (!shared) notFound();

  return (
    <SharedBoard
      shareId={id}
      wireDoc={shared.wireDoc}
      assetBase={shared.assetBase}
    />
  );
}
