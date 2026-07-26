"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROADMAP_PHASES } from "@/lib/ceo-plan";

export default function RoadmapTimeline() {
  const [openId, setOpenId] = useState<string>(ROADMAP_PHASES[0].id);

  return (
    <div className="space-y-2">
      {ROADMAP_PHASES.map((phase, i) => {
        const open = openId === phase.id;
        return (
          <div
            key={phase.id}
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <button
              onClick={() => setOpenId(open ? "" : phase.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
            >
              <span
                className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px]"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "var(--accent)" }}
              >
                {i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{phase.label}</span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>{phase.years}</span>
                </span>
                <span className="block font-mono text-[10px] mt-0.5" style={{ color: "var(--subtle)" }}>
                  {phase.theme}
                </span>
              </span>
              <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                className="flex-shrink-0 font-mono text-xs"
                style={{ color: "var(--muted)" }}
              >
                ›
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <ul className="px-4 pb-4 pl-12 space-y-1.5">
                    {phase.focus.map((f) => (
                      <li key={f} className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
                        <span style={{ color: "var(--accent)" }}>·</span> {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
