import type { Metadata } from "next";
import Board from "@/components/board/board";
import { blobConfigured } from "@/lib/board/api-guard";

export const metadata: Metadata = {
  title: "Board — mynest.cc",
  description:
    "An infinite canvas. Draw, drop in images, pan and zoom forever. Everything stays in your browser until you publish a link.",
};

export default function BoardPage() {
  // Sharing needs a blob store; without one the board still works entirely
  // locally, so the button is simply hidden rather than failing on click.
  return <Board shareEnabled={blobConfigured()} />;
}
