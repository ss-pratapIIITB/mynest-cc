"use client";

import { useMemo } from "react";
import Board from "./board";
import { deserializeDoc } from "@/lib/board/serialize";
import { remoteAssetSource } from "@/lib/board/persist";

interface Props {
  shareId: string;
  /** Wire-format document — bounds are rebuilt here rather than shipped. */
  wireDoc: unknown;
  /** Blob storage prefix the document's assets live under. */
  assetBase: string;
}

/**
 * Read-only view of a published board.
 *
 * The document is deserialized on the client so the server payload stays the
 * compact wire format, and asset bytes are read over HTTP instead of from the
 * visitor's IndexedDB — they have never seen this board before.
 */
export default function SharedBoard({ shareId, wireDoc, assetBase }: Props) {
  const doc = useMemo(() => deserializeDoc(wireDoc), [wireDoc]);
  const assetSource = useMemo(() => remoteAssetSource(assetBase), [assetBase]);

  return (
    <Board
      boardId={`shared:${shareId}`}
      initialDoc={doc}
      assetSource={assetSource}
      readOnly
      title="shared board"
    />
  );
}
