/* Small wording helpers for Home. Dates are Lagos days ("YYYY-MM-DD"). */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const LAGOS_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function weekday(dateKey: string): string {
  return WEEKDAYS[new Date(`${dateKey}T00:00:00Z`).getUTCDay()];
}

export function monthName(month: string): string {
  return MONTHS[Number(month.slice(5, 7)) - 1] ?? month;
}

/** "Wed 28 Oct" */
export function shortDate(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
}

/** "15 March" */
export function dayMonth(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function lagosKey(iso: string): string {
  return new Date(Date.parse(iso) + LAGOS_MS).toISOString().slice(0, 10);
}

export function dayGap(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

function lagosTime(iso: string): string {
  const d = new Date(Date.parse(iso) + LAGOS_MS);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export { lagosTime };

/** "Today, 7:52 pm" / "Yesterday, 8:14 pm" / "Wednesday" / "12 Nov" */
export function whenLine(iso: string, today: string): string {
  const day = lagosKey(iso);
  const gap = dayGap(day, today);
  if (gap === 0) return `Today, ${lagosTime(iso)}`;
  if (gap === 1) return `Yesterday, ${lagosTime(iso)}`;
  if (gap < 7) return weekday(day);
  const d = new Date(`${day}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
}

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

export function thousands(n: number): string {
  return n.toLocaleString("en-NG");
}

/** "₦4,000 for 6 months" */
export function priceLine(priceNaira: number, months: number): string {
  return `₦${thousands(priceNaira)} for ${months} month${months === 1 ? "" : "s"}`;
}

export function greeting(hour: number, firstName: string): string {
  const part = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  return `${part}, ${firstName}.`;
}

/** "2h 45m" */
export function hoursMinutes(ms: number): string {
  const mins = Math.max(0, Math.floor(ms / 60_000));
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** "2d 4h" until the race closes */
export function daysHours(ms: number): string {
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  const d = Math.floor(hours / 24);
  return d > 0 ? `${d}d ${hours % 24}h` : `${hours}h ${Math.max(0, Math.floor(ms / 60_000)) % 60}m`;
}

/** "Wednesday and Thursday", "Tuesday, Wednesday and Thursday" */
export function dayList(dateKeys: string[]): string {
  const names = dateKeys.map(weekday);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const TYPE_LABEL: Record<string, string> = {
  REAL_PAST_QUESTION: "Real past questions",
  PRACTICE: "Practice questions",
  MIXED: "Mixed questions",
  BOOKMARK_EXAM: "Study vault",
  GHOST_RACE: "Ghost race",
  ONE_V_ONE_DUEL: "Duel",
  GROUP_COLLAB: "Duel",
};

export function paperTitle(paper: { examType: string; subjects: string[]; duel: { opponentName: string } | null }): string {
  const n = paper.subjects.length;
  if (paper.duel) return `Duel v ${paper.duel.opponentName} · ${n === 1 ? paper.subjects[0] : `${n} subjects`}`;
  const label = TYPE_LABEL[paper.examType] ?? "Paper";
  return `${n === 1 ? paper.subjects[0] : `${n} subjects`} · ${label}`;
}

/** Next streak-freeze day: 7, then every 14 days (21, 35, ...). */
export function nextFreezeDay(count: number): number {
  if (count < 7) return 7;
  return 7 + Math.ceil((count + 1 - 7) / 14) * 14;
}

/** "UI Post-UTME", "JAMB UTME": short enough for the phone's top bar. */
export function boardLabel(board: { code: string; examName: string }): string {
  const exam = board.examName.trim();
  return exam && !exam.toUpperCase().startsWith(board.code.toUpperCase()) ? `${board.code} ${exam}` : exam || board.code;
}

/** "Adaeze O." */
export function shortName(fullName: string | null | undefined): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}
