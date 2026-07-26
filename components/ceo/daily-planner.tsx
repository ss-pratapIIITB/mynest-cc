"use client";

import { useEffect, useState } from "react";
import { DEFAULT_HABITS, type HabitDefault } from "@/lib/ceo-plan";
import { periodKey, type Cadence } from "@/lib/ceo-dates";

interface HabitItem {
  id: string;
  label: string;
  cadence: Cadence;
}
type CompletionLog = Record<string, string[]>; // period key -> habit ids done that period

const HABITS_KEY = "ceo:habits";
const LOG_KEY = "ceo:completions";

function streakFor(log: CompletionLog, habitId: string, cadence: Cadence): number {
  let streak = 0;
  for (let offset = 0; offset < 3000; offset++) {
    const key = periodKey(cadence, offset);
    if (log[key]?.includes(habitId)) {
      streak++;
    } else {
      if (offset === 0) continue; // today/this-week not done yet doesn't break a streak from prior periods
      break;
    }
  }
  return streak;
}

function seedHabits(defaults: HabitDefault[]): HabitItem[] {
  return defaults.map(({ id, label, cadence }) => ({ id, label, cadence }));
}

export default function DailyPlanner() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [log, setLog] = useState<CompletionLog>({});
  const [loaded, setLoaded] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCadence, setNewCadence] = useState<Cadence>("daily");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // One-time hydration from localStorage on mount — must run as an effect
  // since it reads a browser-only API the server render can't see.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem(HABITS_KEY);
      setHabits(savedHabits ? JSON.parse(savedHabits) : seedHabits(DEFAULT_HABITS));
      const savedLog = localStorage.getItem(LOG_KEY);
      setLog(savedLog ? JSON.parse(savedLog) : {});
    } catch {
      setHabits(seedHabits(DEFAULT_HABITS));
    }
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); } catch {}
  }, [habits, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch {}
  }, [log, loaded]);

  const toggle = (habit: HabitItem) => {
    const key = periodKey(habit.cadence, 0);
    setLog((prev) => {
      const current = prev[key] ?? [];
      const done = current.includes(habit.id);
      return {
        ...prev,
        [key]: done ? current.filter((id) => id !== habit.id) : [...current, habit.id],
      };
    });
  };

  const addHabit = () => {
    const label = newLabel.trim();
    if (!label) return;
    setHabits((prev) => [...prev, { id: `custom-${Date.now()}`, label, cadence: newCadence }]);
    setNewLabel("");
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const startEdit = (h: HabitItem) => {
    setEditingId(h.id);
    setEditValue(h.label);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const label = editValue.trim();
    if (label) {
      setHabits((prev) => prev.map((h) => (h.id === editingId ? { ...h, label } : h)));
    }
    setEditingId(null);
  };

  if (!loaded) return null;

  const renderGroup = (cadence: Cadence) => {
    const items = habits.filter((h) => h.cadence === cadence);
    const key = periodKey(cadence, 0);
    const doneToday = log[key] ?? [];

    return (
      <div>
        <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>
          {cadence === "daily" ? "DAILY" : "WEEKLY"}
        </p>
        <ul className="space-y-1.5">
          {items.map((h) => {
            const done = doneToday.includes(h.id);
            const streak = streakFor(log, h.id, h.cadence);
            return (
              <li
                key={h.id}
                className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                style={{ background: done ? "rgba(12,163,12,0.06)" : "var(--bg)", border: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => toggle(h)}
                  aria-label={done ? "Mark not done" : "Mark done"}
                  className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded border cursor-pointer"
                  style={{
                    borderColor: done ? "#0ca30c" : "var(--border)",
                    background: done ? "#0ca30c" : "transparent",
                    color: "#fff",
                  }}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>

                {editingId === h.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                    className="flex-1 min-w-0 bg-transparent font-mono text-[11px] outline-none"
                    style={{ color: "var(--text)" }}
                  />
                ) : (
                  <span
                    className="flex-1 min-w-0 truncate font-mono text-[11px] cursor-text"
                    style={{ color: "var(--text)", textDecoration: done ? "line-through" : "none" }}
                    onClick={() => startEdit(h)}
                    title="Click to rename"
                  >
                    {h.label}
                  </span>
                )}

                {streak > 0 && (
                  <span className="flex-shrink-0 font-mono text-[9px]" style={{ color: "var(--amber)" }}>
                    🔥{streak}
                  </span>
                )}

                <button
                  onClick={() => removeHabit(h.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 font-mono text-[10px] transition-opacity cursor-pointer"
                  style={{ color: "var(--subtle)" }}
                  aria-label="Remove habit"
                >
                  ✕
                </button>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="font-mono text-[10px]" style={{ color: "var(--subtle)" }}>
              No {cadence} habits yet.
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderGroup("daily")}
      {renderGroup("weekly")}

      <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--subtle)" }}>
          ADD HABIT
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="New habit..."
            className="flex-1 min-w-[140px] rounded-lg px-2.5 py-1.5 font-mono text-[11px] outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <select
            value={newCadence}
            onChange={(e) => setNewCadence(e.target.value as Cadence)}
            className="rounded-lg px-2 py-1.5 font-mono text-[11px] outline-none cursor-pointer"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
          </select>
          <button
            onClick={addHabit}
            className="rounded-lg px-3 py-1.5 font-mono text-[11px] cursor-pointer"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "var(--accent)" }}
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}
