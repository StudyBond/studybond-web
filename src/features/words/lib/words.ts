import type { CameOut, WordKind } from "../types";

/* Plain helpers for the word pages and the dashboard card. No React, so
   they can be checked on their own. All dates are Lagos calendar days as
   "YYYY-MM-DD" strings; they are read as UTC so they never shift a day. */

export const KIND_LABEL: Record<WordKind, string> = { WORD: "Word", IDIOM: "Idiom", PHRASAL_VERB: "Phrasal verb" };
export const KIND_OF_THE_DAY: Record<WordKind, string> = {
  WORD: "Word of the day",
  IDIOM: "Idiom of the day",
  PHRASAL_VERB: "Phrasal verb of the day",
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parts(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return { y, m, d, weekday: date.getUTCDay() };
}

/** "Thursday, 19 November 2026" */
export function longDay(day: string): string {
  const { y, m, d, weekday } = parts(day);
  return `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

/** "Thu 19 Nov" */
export function shortDay(day: string): string {
  const { m, d, weekday } = parts(day);
  return `${WEEKDAYS[weekday].slice(0, 3)} ${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

export function addDays(day: string, n: number): string {
  const { y, m, d } = parts(day);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** "Today", "Tomorrow", or "Sat 21 Nov". */
export function dueLabel(today: string, due: string | null): string {
  if (!due) return "";
  if (due <= today) return "Today";
  if (due === addDays(today, 1)) return "Tomorrow";
  return shortDay(due);
}

/** The pill on a card: "From JAMB 1978", or "JAMB 1980 and 1981" when it came out more than once. */
export function yearPill(cameOut: CameOut): string {
  const board = cameOut.board ?? "JAMB";
  if (cameOut.years.length === 0) return `From ${board}`;
  if (cameOut.years.length === 1) return `From ${board} ${cameOut.years[0]}`;
  return `${board} ${joinYears(cameOut.years)}`;
}

/** Under an earlier word: "JAMB 1980", or "Came out twice: JAMB 1980 and 1981". */
export function cameOutLine(cameOut: CameOut): { text: string; repeated: boolean } {
  const board = cameOut.board ?? "JAMB";
  const years = cameOut.years;
  if (years.length <= 1) return { text: years.length ? `${board} ${years[0]}` : board, repeated: false };
  const times = years.length === 2 ? "twice" : years.length === 3 ? "three times" : `${years.length} times`;
  return { text: `Came out ${times}: ${board} ${joinYears(years)}`, repeated: true };
}

function joinYears(years: number[]): string {
  if (years.length <= 1) return years.join("");
  return `${years.slice(0, -1).join(", ")} and ${years[years.length - 1]}`;
}

export type SayPart = { text: string; stressed: boolean };

/**
 * "in-SOL-vent" -> in- | SOL (stressed) | -vent. A part in capitals is the
 * stressed one ("take O-ver", "get a-WAY with", "neck and NECK"). Text after
 * a space in brackets ("GAG (rhymes with bag)") stays plain.
 */
export function sayParts(sayAs: string): SayPart[] {
  const out: SayPart[] = [];
  const tokens = sayAs.split(/([\s-]+|\([^)]*\))/).filter((token) => token !== "");
  for (const token of tokens) {
    const stressed = /[A-Z]/.test(token) && token === token.toUpperCase() && /^[A-Z']+$/.test(token);
    const last = out[out.length - 1];
    if (last && !last.stressed && !stressed) last.text += token;
    else out.push({ text: token, stressed });
  }
  return out;
}

export type SentencePart = { text: string; underlined: boolean };

/** The tested sentence keeps its <u>...</u>; nothing else in it is HTML, so it is drawn as text. */
export function sentenceParts(sentence: string): SentencePart[] {
  const out: SentencePart[] = [];
  const re = /<u>([\s\S]*?)<\/u>/g;
  let at = 0;
  for (let match = re.exec(sentence); match; match = re.exec(sentence)) {
    if (match.index > at) out.push({ text: sentence.slice(at, match.index), underlined: false });
    out.push({ text: match[1], underlined: true });
    at = match.index + match[0].length;
  }
  if (at < sentence.length) out.push({ text: sentence.slice(at), underlined: false });
  return out.map((part) => ({ ...part, text: part.text.replace(/<\/?u>/g, "") }));
}

/** "the 1978 question", for the button that opens it. */
export function questionLabel(year: number | null | undefined): string {
  return year ? `Try the ${year} question` : "Try the real question";
}

/** The word book line after "Not yet": when the card comes back. */
export function comesBackLine(today: string): string {
  return `Added to your word book. It comes back tomorrow, ${shortDay(addDays(today, 1))}.`;
}

/** Cut long text at a word, so the slip never runs out of room. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 15)).replace(/[\s,;:.]+$/, "")}…`;
}
