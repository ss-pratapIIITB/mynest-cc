import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "3D World — mynest.cc",
  description:
    "A browser-based 3D interactive world. Drive a cart, collect coins, climb escalators, and don't drown.",
};

export default function PlayPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Back link — sits above the iframe */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all duration-150"
      >
        ← back
      </Link>

      {/* The game — fills the entire viewport */}
      <iframe
        src="/play/index.html"
        title="3D World"
        className="w-full h-full border-0"
        allow="fullscreen"
        // Prevents the iframe from capturing keyboard before user clicks into it
        style={{ display: "block" }}
      />
    </main>
  );
}
