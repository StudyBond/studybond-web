import type { QuestionState, SubjectRange } from "@/features/exam/stores/exam-store";

/**
 * "Four papers, one clock": helpers shared by the paper rail, the ribbon and
 * the submit check. A paper is one subject's run of questions in the sitting.
 */

/** Amber, used everywhere when the student turns paper colour off. */
export const FLAT_COLOUR = "#e09040";

const NAMED_COLOURS: Array<[RegExp, string]> = [
  [/english/i, "#fb7185"],
  [/biology/i, "#4ade80"],
  [/chemistry/i, "#2dd4bf"],
  [/physics/i, "#a78bfa"],
];
const SPARE_COLOURS = ["#fb7185", "#4ade80", "#2dd4bf", "#a78bfa"];

/**
 * One colour per paper. The four JAMB science papers keep their own colour;
 * any other subject takes the first colour no other paper in the sitting uses.
 */
export function paperColours(subjects: string[]): string[] {
  const out: Array<string | null> = subjects.map(
    (s) => NAMED_COLOURS.find(([re]) => re.test(s))?.[1] ?? null,
  );
  return out.map((colour, i) => {
    if (colour) return colour;
    const free = SPARE_COLOURS.find((c) => !out.includes(c));
    const pick = free ?? SPARE_COLOURS[i % SPARE_COLOURS.length];
    out[i] = pick;
    return pick;
  });
}

/** "rgba(...)" at 12%, for the chosen option's fill. */
export function softColour(hex: string, alpha = 0.12): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Short name for the rail: "Use of English" and "English Language" read as "English". */
export function paperLabel(subject: string): string {
  if (/english/i.test(subject)) return "English";
  return subject.replace(/\s+language$/i, "").trim();
}

/** The ribbon groups questions in tens, or in fives for a short paper. */
export function ribbonGroupSize(count: number): number {
  return count > 20 ? 10 : 5;
}

export function paperOfIndex(ranges: SubjectRange[], index: number): number {
  const k = ranges.findIndex((r) => index >= r.startIndex && index <= r.endIndex);
  return k < 0 ? 0 : k;
}

/** Seconds spent in a paper so far, counting the question open right now. */
export function secondsInPaper(
  range: SubjectRange,
  questionIds: number[],
  states: Map<number, QuestionState>,
  now: number,
): number {
  let total = 0;
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    const st = states.get(questionIds[i]);
    if (!st) continue;
    total += st.timeSpentSeconds;
    if (st.enteredAt !== null) total += Math.max(0, (now - st.enteredAt) / 1000);
  }
  return total;
}

export function answeredInPaper(
  range: SubjectRange,
  questionIds: number[],
  states: Map<number, QuestionState>,
): number {
  let n = 0;
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    if (states.get(questionIds[i])?.answer) n++;
  }
  return n;
}

export type Pace = {
  /** 0-based position in the paper the clock says you should have reached. */
  should: number;
  /** Positive: ahead of the tick. Negative: behind it. */
  diff: number;
  late: boolean;
  word: string;
};

/**
 * Where the clock says you should be in this paper:
 * spent / (total time / papers) x questions in the paper.
 */
export function paceIn(spentSeconds: number, budgetSeconds: number, count: number, positionInPaper: number): Pace {
  const should = Math.max(0, Math.min(count - 1, Math.round((spentSeconds / Math.max(1, budgetSeconds)) * count)));
  const diff = positionInPaper - should;
  const word = diff >= 2 ? `${diff} ahead` : diff <= -2 ? `${-diff} behind` : "on pace";
  return { should, diff, late: diff <= -2, word };
}

export function formatClock(seconds: number): string {
  const sec = Math.max(0, Math.round(seconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (h ? `${h}:` : "") + `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
