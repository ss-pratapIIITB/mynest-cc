// Shared date-key helpers for anything in /ceo that persists per-day or
// per-week to localStorage (habit tracker, mind/body check-in).

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function weekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export type Cadence = "daily" | "weekly";

export function periodKey(cadence: Cadence, offset: number): string {
  if (cadence === "daily") {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return todayKey(d);
  }
  const d = new Date();
  d.setDate(d.getDate() - offset * 7);
  return weekKey(d);
}

/** Last N calendar day keys, most recent last. */
export function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  for (let offset = n - 1; offset >= 0; offset--) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    keys.push(todayKey(d));
  }
  return keys;
}

export function shortDayLabel(dateKey: string): string {
  const d = new Date(dateKey + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).slice(0, 2);
}
