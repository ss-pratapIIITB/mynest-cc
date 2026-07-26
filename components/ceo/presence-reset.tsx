"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  { label: "Breathe in", duration: 4, scale: 1.3 },
  { label: "Hold", duration: 4, scale: 1.3 },
  { label: "Breathe out", duration: 4, scale: 0.85 },
  { label: "Hold", duration: 4, scale: 0.85 },
];

const GROUNDING = [
  "5 things you can see",
  "4 things you can physically feel (chair, feet, fabric)",
  "3 things you can hear",
  "2 things you can smell",
  "1 thing you can taste",
];

export default function PresenceReset() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setPhaseIndex((i) => (i + 1) % PHASES.length), PHASES[phaseIndex].duration * 1000);
    return () => clearTimeout(t);
  }, [active, phaseIndex]);

  const start = () => {
    setPhaseIndex(0);
    setActive(true);
  };
  const stop = () => setActive(false);

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-mono text-[11px]" style={{ color: "var(--text)" }}>
          Noticed you&apos;re somewhere else? Use this — right now, takes under a minute.
        </p>
        <button
          onClick={active ? stop : start}
          className="flex-shrink-0 rounded-lg px-3 py-1.5 font-mono text-[10px] cursor-pointer"
          style={
            active
              ? { background: "rgba(208,59,59,0.1)", border: "1px solid rgba(208,59,59,0.3)", color: "#d03b3b" }
              : { background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "var(--accent)" }
          }
        >
          {active ? "stop" : "start reset"}
        </button>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-center py-6">
              <motion.div
                animate={{ scale: PHASES[phaseIndex].scale }}
                transition={{ duration: PHASES[phaseIndex].duration, ease: "easeInOut" }}
                className="h-20 w-20 rounded-full flex items-center justify-center mb-3"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: "var(--accent)" }} />
              </motion.div>
              <p className="font-mono text-[11px] tracking-wide" style={{ color: "var(--text)" }}>
                {PHASES[phaseIndex].label}
              </p>
            </div>

            <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>
                THEN NAME, OUT LOUD OR IN YOUR HEAD
              </p>
              <ul className="space-y-1">
                {GROUNDING.map((g) => (
                  <li key={g} className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    <span style={{ color: "var(--accent)" }}>·</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
