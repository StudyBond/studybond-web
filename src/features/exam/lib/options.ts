import type { ExamQuestion } from "@/lib/api/types";

export type OptionLetter = "A" | "B" | "C" | "D" | "E";

export type QuestionOption = { key: OptionLetter; text: string | null; image: string | null };

const LETTERS: OptionLetter[] = ["A", "B", "C", "D", "E"];

/** The options a question really has (E is often empty), in stored order. */
export function optionsOf(q: ExamQuestion): QuestionOption[] {
  const text: Record<OptionLetter, string | null> = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD, E: q.optionE };
  const image: Record<OptionLetter, string | null> = {
    A: q.optionAImageUrl,
    B: q.optionBImageUrl,
    C: q.optionCImageUrl,
    D: q.optionDImageUrl,
    E: q.optionEImageUrl,
  };
  return LETTERS.map((key) => ({ key, text: text[key], image: image[key] })).filter((o) => o.text || o.image);
}

/** Questions that share a passage or diagram sit next to each other. */
export function sharedGroup<Q extends ExamQuestion>(questions: Q[], index: number): { start: number; end: number } | null {
  const q = questions[index];
  if (!q?.parentQuestionText && !q?.parentQuestionImageUrl) return null;
  const same = (o: Q | undefined) =>
    !!o && o.parentQuestionText === q.parentQuestionText && o.parentQuestionImageUrl === q.parentQuestionImageUrl;
  let start = index;
  let end = index;
  while (same(questions[start - 1])) start--;
  while (same(questions[end + 1])) end++;
  return { start, end };
}
