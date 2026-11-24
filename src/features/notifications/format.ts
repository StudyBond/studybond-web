/* Times and dates in the inbox, in Lagos time like the rest of StudyBond. */

const LAGOS_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function lagos(iso: string | number) {
  return new Date((typeof iso === "number" ? iso : Date.parse(iso)) + LAGOS_MS);
}

/** "2026-11-24" in Lagos. */
export function dayKey(iso: string | number) {
  return lagos(iso).toISOString().slice(0, 10);
}

export function daysAgo(iso: string, now = Date.now()) {
  return Math.round((Date.parse(`${dayKey(now)}T00:00:00Z`) - Date.parse(`${dayKey(iso)}T00:00:00Z`)) / DAY_MS);
}

/** "9:02 pm" */
export function clock(iso: string | number) {
  const d = lagos(iso);
  const h = d.getUTCHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** "24 Nov" */
export function dayMonth(iso: string | number) {
  const d = lagos(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** The time on a note: "9:02 pm" today and yesterday, "Sat" this week, then "18 Nov". */
export function noteTime(iso: string, now = Date.now()) {
  const gap = daysAgo(iso, now);
  if (gap <= 1) return clock(iso);
  if (gap < 7) return DAYS[lagos(iso).getUTCDay()];
  return dayMonth(iso);
}

export type DayGroup = "Today" | "Yesterday" | "Earlier";

export function dayGroup(iso: string, now = Date.now()): DayGroup {
  const gap = daysAgo(iso, now);
  return gap <= 0 ? "Today" : gap === 1 ? "Yesterday" : "Earlier";
}

/** "Until 11:50 pm" on the same day, else "Until 2 Dec". */
export function untilLabel(expiresAt: string, now = Date.now()) {
  return daysAgo(expiresAt, now) === 0 ? `Until ${clock(expiresAt)}` : `Until ${dayMonth(expiresAt)}`;
}

/** "28 min" or "2h 45m". */
export function leftLabel(ms: number) {
  const mins = Math.max(1, Math.ceil(ms / 60_000));
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** Midnight tonight in Lagos. */
export function lagosMidnight(now = Date.now()) {
  return Date.parse(`${dayKey(now)}T00:00:00Z`) + DAY_MS - LAGOS_MS;
}

/** "25 and 24 Nov", or "2 Dec and 28 Nov" across months. */
export function dateList(isos: string[]) {
  const parts = isos.map((iso) => {
    const d = lagos(iso);
    return { day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()] };
  });
  if (parts.length === 0) return "";
  const sameMonth = parts.every((p) => p.month === parts[0].month);
  const words = sameMonth ? parts.map((p) => String(p.day)) : parts.map((p) => `${p.day} ${p.month}`);
  const joined = words.length === 1 ? words[0] : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
  return sameMonth ? `${joined} ${parts[0].month}` : joined;
}
