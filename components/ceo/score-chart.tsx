"use client";

import { useState } from "react";
import { ASSESSMENT_SCORES, tierFor, type ScoreTier } from "@/lib/ceo-plan";

/* ── Status palette (fixed, mode-invariant — see dataviz skill) ── */
const TIER_META: Record<ScoreTier, { color: string; label: string; icon: string }> = {
  strength: { color: "#0ca30c", label: "Strength", icon: "▲" },
  developing: { color: "#fab219", label: "Developing", icon: "●" },
  priority: { color: "#d03b3b", label: "Priority", icon: "▼" },
};

export default function ScoreChart() {
  const [tableView, setTableView] = useState(false);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          {(Object.keys(TIER_META) as ScoreTier[]).map((tier) => (
            <span key={tier} className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: "var(--muted)" }}>
              <span style={{ color: TIER_META[tier].color }}>{TIER_META[tier].icon}</span>
              {TIER_META[tier].label}
            </span>
          ))}
        </div>
        <button
          onClick={() => setTableView((v) => !v)}
          className="font-mono text-[10px] tracking-wide underline cursor-pointer"
          style={{ color: "var(--subtle)" }}
        >
          {tableView ? "view as chart" : "view as table"}
        </button>
      </div>

      {tableView ? (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <table className="w-full font-mono text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-3 py-2 text-left" style={{ color: "var(--muted)" }}>Skill</th>
                <th className="px-3 py-2 text-left" style={{ color: "var(--muted)" }}>Tier</th>
                <th className="px-3 py-2 text-right" style={{ color: "var(--muted)" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {ASSESSMENT_SCORES.map((s) => {
                const tier = tierFor(s.score);
                return (
                  <tr key={s.name} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-3 py-2" style={{ color: "var(--text)" }}>{s.name}</td>
                    <td className="px-3 py-2" style={{ color: TIER_META[tier].color }}>
                      {TIER_META[tier].icon} {TIER_META[tier].label}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: "var(--text)" }}>{s.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2">
          {ASSESSMENT_SCORES.map((s) => {
            const tier = tierFor(s.score);
            const meta = TIER_META[tier];
            return (
              <div key={s.name} className="group" title={s.definition}>
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] truncate" style={{ color: "var(--text)" }}>
                    {s.name}
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[9px]" style={{ color: meta.color }}>
                      {meta.icon}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--muted)" }}>
                      {s.score}
                    </span>
                  </span>
                </div>
                <div
                  className="h-[10px] w-full rounded-r-[4px] overflow-hidden"
                  style={{ background: "var(--border)" }}
                >
                  <div
                    className="h-full rounded-r-[4px] transition-[width] duration-500"
                    style={{ width: `${s.score}%`, background: meta.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
