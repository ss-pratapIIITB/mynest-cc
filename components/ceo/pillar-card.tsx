"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ASSESSMENT_SCORES, ROADMAP_PHASES, tierFor, type Pillar } from "@/lib/ceo-plan";

const TIER_COLOR = { strength: "#0ca30c", developing: "#fab219", priority: "#d03b3b" } as const;

function scoreFor(name: string): number | undefined {
  return ASSESSMENT_SCORES.find((s) => s.name === name)?.score;
}

export default function PillarCard({ pillar }: { pillar: Pillar }) {
  const [open, setOpen] = useState(false);
  const isGap = pillar.category === "gap";

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-mono text-sm" style={{ color: "var(--text)" }}>{pillar.name}</h3>
        <span
          className="flex-shrink-0 font-mono text-[9px] px-2 py-0.5 rounded-full tracking-wide"
          style={
            isGap
              ? { background: "rgba(208,59,59,0.1)", border: "1px solid rgba(208,59,59,0.25)", color: "#d03b3b" }
              : { background: "rgba(12,163,12,0.1)", border: "1px solid rgba(12,163,12,0.25)", color: "#0ca30c" }
          }
        >
          {isGap ? "GAP" : "LEVERAGE"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {pillar.relatedSkills.map((name) => {
          const score = scoreFor(name);
          if (score === undefined) return null;
          const color = TIER_COLOR[tierFor(score)];
          return (
            <span
              key={name}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg)", border: `1px solid ${color}40`, color }}
            >
              {name} {score}
            </span>
          );
        })}
      </div>

      <p className="font-mono text-[11px] leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
        {pillar.whyItMatters}
      </p>

      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[10px] underline cursor-pointer"
        style={{ color: "var(--subtle)" }}
      >
        {open ? "hide actions, books & roadmap" : "show actions, books & roadmap"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div>
                <p className="font-mono text-[9px] tracking-widest mb-1.5" style={{ color: "var(--subtle)" }}>
                  WEEKLY ACTIONS
                </p>
                <ul className="space-y-1">
                  {pillar.weeklyActions.map((a) => (
                    <li key={a} className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--text)" }}>
                      <span style={{ color: "var(--accent)" }}>→</span> {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[9px] tracking-widest mb-1.5" style={{ color: "var(--subtle)" }}>
                  BOOKS
                </p>
                <ul className="space-y-1.5">
                  {pillar.books.map((b) => (
                    <li key={b.title} className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--text)" }}>
                      <span style={{ color: "var(--muted)" }}>{b.title}</span> — {b.author}
                      <span className="block text-[10px]" style={{ color: "var(--subtle)" }}>{b.why}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[9px] tracking-widest mb-1.5" style={{ color: "var(--subtle)" }}>
                  ROADMAP
                </p>
                <ul className="space-y-1">
                  {pillar.milestones.map((m, i) => (
                    <li key={m} className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--muted)" }}>
                      <span style={{ color: "var(--subtle)" }}>{ROADMAP_PHASES[i].years}:</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
