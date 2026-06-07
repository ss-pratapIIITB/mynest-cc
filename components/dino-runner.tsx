"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DinoRunner() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="border-t border-zinc-200 dark:border-[#1c1c1e] mt-auto">
      {/* Label row */}
      <div className="px-6 sm:px-10 pt-3 pb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-700">
          <span className="text-violet-400/60 dark:text-violet-500/50">chrome://dino</span>
          {" "}· spacebar or click
        </span>
        <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-700 hidden sm:block">
          the offline page — a cultural touchstone
        </span>
      </div>

      {/* Iframe — isolated from React lifecycle, no double-render issues.
          CSS filter inverts the white game canvas to match dark mode. */}
      <div
        style={{
          filter: isDark ? "invert(1)" : "brightness(0.96)",
          height: 200,
          overflow: "hidden",
        }}
      >
        {mounted && (
          <iframe
            src="/dino/index.html"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title="Chrome Dinosaur Game"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
}
