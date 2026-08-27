/**
 * Week / day helpers for the planner.
 *
 * Everything is done with "date keys" — plain `YYYY-MM-DD` strings with no
 * timezone — to sidestep off-by-one bugs. Keys are stored in the DB as UTC
 * midnight (`dateKeyToUTC`). "Today" is derived from the viewer's *local*
 * calendar date so the highlighted day matches what they see on a wall calendar.
 */

const pad = (n: number) => String(n).padStart(2, "0");

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dateKeyToUTC(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function utcToDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Valid `YYYY-MM-DD` that round-trips. */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = dateKeyToUTC(value);
  return !Number.isNaN(d.getTime()) && utcToDateKey(d) === value;
}

export function addDaysKey(key: string, days: number): string {
  const d = dateKeyToUTC(key);
  d.setUTCDate(d.getUTCDate() + days);
  return utcToDateKey(d);
}

export function addWeeksKey(key: string, weeks: number): string {
  return addDaysKey(key, weeks * 7);
}

/** Monday of the week containing `key`. */
export function startOfWeekKey(key: string): string {
  const d = dateKeyToUTC(key);
  const daysSinceMonday = (d.getUTCDay() + 6) % 7; // Sun=0 -> 6, Mon=1 -> 0
  return addDaysKey(key, -daysSinceMonday);
}

export function currentWeekStartKey(): string {
  return startOfWeekKey(todayKey());
}

/** The 7 date keys Mon…Sun for a week starting at `weekStartKey`. */
export function weekDayKeys(weekStartKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysKey(weekStartKey, i));
}

export function isTodayKey(key: string): boolean {
  return key === todayKey();
}

export function formatDayLabel(key: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const d = dateKeyToUTC(key);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    day: String(d.getUTCDate()),
    month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
  };
}

/** e.g. "3–9 Mar 2026" or "30 Mar – 5 Apr 2026". */
export function formatWeekRange(weekStartKey: string): string {
  const start = dateKeyToUTC(weekStartKey);
  const end = dateKeyToUTC(addDaysKey(weekStartKey, 6));
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", timeZone: "UTC" };
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startStr = start.toLocaleDateString(
    "en-GB",
    sameMonth ? opts : { ...opts, month: "short" },
  );
  const endStr = end.toLocaleDateString("en-GB", {
    ...opts,
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}
