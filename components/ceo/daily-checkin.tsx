"use client";

import { useEffect, useMemo, useState } from "react";
import { todayKey, lastNDayKeys, shortDayLabel } from "@/lib/ceo-dates";

type Energy = "low" | "medium" | "high";
type Pain = "none" | "back" | "other";
type Presence = "scattered" | "mixed" | "present";

interface CheckinEntry {
  energy: Energy;
  fog: boolean;
  pain: Pain;
  painNote: string;
  presence: Presence;
  sleepHours: number | null;
  priorities: [string, string, string];
}

type CheckinLog = Record<string, CheckinEntry>;

const LOG_KEY = "ceo:checkins";
const HISTORY_DAYS = 14;

function emptyEntry(): CheckinEntry {
  return { energy: "medium", fog: false, pain: "none", painNote: "", presence: "mixed", sleepHours: null, priorities: ["", "", ""] };
}

function suggestionsFor(entry: CheckinEntry): string[] {
  const out: string[] = [];
  if (entry.pain === "back") {
    out.push("Stand up and stretch for 5 minutes, check your desk/chair posture, and take a short walk this hour — don't let this sit unaddressed again.");
  } else if (entry.pain === "other") {
    out.push("Note it, don't push through it silently — decide on one concrete action for it today, even a small one.");
  }
  if (entry.fog) {
    out.push("Hydrate, get 10 minutes of daylight or movement, and delay any big decision by 30 minutes until it clears.");
  }
  if (entry.presence === "scattered") {
    out.push("You're mostly elsewhere today — run the Presence Reset below before anything else, then come back to the task.");
  }
  if (entry.energy === "low" && entry.sleepHours !== null && entry.sleepHours < 6) {
    out.push("Protect tonight's wind-down habit and avoid stacking hard conversations after 3pm today.");
  }
  if (out.length === 0) {
    out.push(
      entry.energy === "high"
        ? "Good baseline — point today's deep-focus block at a gap pillar (Strategic Thinking or the conversation you're avoiding), not just inbox work."
        : "Log today's state honestly. One day tells you little — the 14-day pattern below is what actually matters."
    );
  }
  return out;
}

export default function DailyCheckin() {
  const [entry, setEntry] = useState<CheckinEntry>(emptyEntry());
  const [log, setLog] = useState<CheckinLog>({});
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const key = todayKey();

  /* One-time hydration from localStorage — browser-only API, can't run on the server. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      const parsed: CheckinLog = raw ? JSON.parse(raw) : {};
      setLog(parsed);
      // Merge over defaults so entries saved before a new field (e.g. presence)
      // was added still hydrate cleanly.
      if (parsed[key]) setEntry({ ...emptyEntry(), ...parsed[key] });
    } catch {}
    setLoaded(true);
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = () => {
    const next = { ...log, [key]: entry };
    setLog(next);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(next)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const history = useMemo(() => lastNDayKeys(HISTORY_DAYS), []);
  const fogDays = history.filter((d) => log[d]?.fog).length;
  const painDays = history.filter((d) => log[d]?.pain && log[d]?.pain !== "none").length;
  const scatteredDays = history.filter((d) => log[d]?.presence === "scattered").length;

  if (!loaded) return null;

  const energyColor = { low: "#d03b3b", medium: "#fab219", high: "#0ca30c" }[entry.energy];
  const suggestions = suggestionsFor(entry);

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div>
          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>ENERGY</p>
          <div className="flex gap-2 mb-4">
            {(["low", "medium", "high"] as Energy[]).map((e) => (
              <button
                key={e}
                onClick={() => setEntry((p) => ({ ...p, energy: e }))}
                className="flex-1 rounded-lg py-1.5 font-mono text-[10px] capitalize cursor-pointer transition-colors"
                style={
                  entry.energy === e
                    ? { background: `${{ low: "#d03b3b", medium: "#fab219", high: "#0ca30c" }[e]}22`, border: `1px solid ${{ low: "#d03b3b", medium: "#fab219", high: "#0ca30c" }[e]}`, color: { low: "#d03b3b", medium: "#fab219", high: "#0ca30c" }[e] }
                    : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }
                }
              >
                {e}
              </button>
            ))}
          </div>

          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>MENTAL CLARITY</p>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setEntry((p) => ({ ...p, fog: false }))}
              className="flex-1 rounded-lg py-1.5 font-mono text-[10px] cursor-pointer"
              style={!entry.fog ? { background: "rgba(12,163,12,0.12)", border: "1px solid #0ca30c", color: "#0ca30c" } : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              clear
            </button>
            <button
              onClick={() => setEntry((p) => ({ ...p, fog: true }))}
              className="flex-1 rounded-lg py-1.5 font-mono text-[10px] cursor-pointer"
              style={entry.fog ? { background: "rgba(208,59,59,0.12)", border: "1px solid #d03b3b", color: "#d03b3b" } : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              foggy
            </button>
          </div>

          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>PRESENCE — ARE YOU ACTUALLY HERE RIGHT NOW</p>
          <div className="flex gap-2 mb-4">
            {(["scattered", "mixed", "present"] as Presence[]).map((p) => (
              <button
                key={p}
                onClick={() => setEntry((prev) => ({ ...prev, presence: p }))}
                className="flex-1 rounded-lg py-1.5 font-mono text-[10px] capitalize cursor-pointer"
                style={
                  entry.presence === p
                    ? {
                        background: `${{ scattered: "#d03b3b", mixed: "#fab219", present: "#0ca30c" }[p]}22`,
                        border: `1px solid ${{ scattered: "#d03b3b", mixed: "#fab219", present: "#0ca30c" }[p]}`,
                        color: { scattered: "#d03b3b", mixed: "#fab219", present: "#0ca30c" }[p],
                      }
                    : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }
                }
              >
                {p}
              </button>
            ))}
          </div>

          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>PHYSICAL PAIN</p>
          <div className="flex gap-2 mb-2">
            {(["none", "back", "other"] as Pain[]).map((p) => (
              <button
                key={p}
                onClick={() => setEntry((prev) => ({ ...prev, pain: p }))}
                className="flex-1 rounded-lg py-1.5 font-mono text-[10px] capitalize cursor-pointer"
                style={
                  entry.pain === p
                    ? { background: "rgba(208,59,59,0.12)", border: "1px solid #d03b3b", color: "#d03b3b" }
                    : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }
                }
              >
                {p === "none" ? "none" : p}
              </button>
            ))}
          </div>
          {entry.pain !== "none" && (
            <input
              value={entry.painNote}
              onChange={(e) => setEntry((p) => ({ ...p, painNote: e.target.value }))}
              placeholder="Where / what triggered it..."
              className="w-full mb-4 rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          )}

          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>SLEEP LAST NIGHT (HOURS)</p>
          <input
            type="number"
            min={0}
            max={14}
            step={0.5}
            value={entry.sleepHours ?? ""}
            onChange={(e) => setEntry((p) => ({ ...p, sleepHours: e.target.value === "" ? null : Number(e.target.value) }))}
            className="w-24 mb-4 rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />

          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>TOP 3 OUTCOMES FOR TODAY</p>
          <div className="space-y-1.5 mb-4">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                value={entry.priorities[i]}
                onChange={(e) =>
                  setEntry((p) => {
                    const next = [...p.priorities] as [string, string, string];
                    next[i] = e.target.value;
                    return { ...p, priorities: next };
                  })
                }
                placeholder={`Priority ${i + 1}`}
                className="w-full rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            ))}
          </div>

          <button
            onClick={save}
            className="w-full rounded-lg py-2 font-mono text-[11px] cursor-pointer"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "var(--accent)" }}
          >
            {saved ? "saved ✓" : "save today's check-in"}
          </button>
        </div>

        {/* ── Suggestions + history ── */}
        <div>
          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>RIGHT NOW</p>
          <ul className="space-y-2 mb-5">
            {suggestions.map((s) => (
              <li key={s} className="font-mono text-[11px] leading-relaxed rounded-lg px-3 py-2" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span style={{ color: energyColor }}>→</span> {s}
              </li>
            ))}
          </ul>

          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>
            LAST {HISTORY_DAYS} DAYS — SO THIS STOPS BEING IGNORABLE
          </p>
          <div className="flex gap-1 mb-3">
            {history.map((d) => {
              const day = log[d];
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1" title={d}>
                  <div
                    className="w-full h-6 rounded flex items-center justify-center"
                    style={{
                      background: day ? { low: "#d03b3b", medium: "#fab219", high: "#0ca30c" }[day.energy] + "22" : "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {day?.pain && day.pain !== "none" && <span className="text-[9px]">🔴</span>}
                    {day?.fog && <span className="text-[9px]">💭</span>}
                    {day?.presence === "scattered" && <span className="text-[9px]">🌀</span>}
                  </div>
                  <span className="font-mono text-[8px]" style={{ color: "var(--subtle)" }}>{shortDayLabel(d)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4">
            <p className="font-mono text-[10px]" style={{ color: fogDays >= 5 ? "#d03b3b" : "var(--muted)" }}>
              Brain fog: {fogDays}/{HISTORY_DAYS} days
            </p>
            <p className="font-mono text-[10px]" style={{ color: painDays >= 5 ? "#d03b3b" : "var(--muted)" }}>
              Pain: {painDays}/{HISTORY_DAYS} days
            </p>
            <p className="font-mono text-[10px]" style={{ color: scatteredDays >= 5 ? "#d03b3b" : "var(--muted)" }}>
              Not present: {scatteredDays}/{HISTORY_DAYS} days
            </p>
          </div>
          {(fogDays >= 5 || painDays >= 5) && (
            <p className="font-mono text-[10px] leading-relaxed mt-2" style={{ color: "#d03b3b" }}>
              That&apos;s a pattern, not a bad day. Worth an actual doctor/physio visit, not another workaround.
            </p>
          )}
          {scatteredDays >= 5 && (
            <p className="font-mono text-[10px] leading-relaxed mt-2" style={{ color: "#d03b3b" }}>
              Not present most days is also a pattern. The daily presence habit and the reset tool below exist specifically for this — use them before adding anything else to the plan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
