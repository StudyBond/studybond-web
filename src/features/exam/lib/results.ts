import type { QuestionWithAnswer } from "@/lib/api/types";

/** r: correct, w: wrong, b: no answer. */
export type Status = "r" | "w" | "b";

export const STATUS_WORD: Record<Status, string> = { r: "correct", w: "wrong", b: "no answer" };

export function statusOf(q: QuestionWithAnswer): Status {
  if (!q.userAnswer) return "b";
  return q.isCorrect ? "r" : "w";
}

export type ResultPaper = {
  subject: string;
  /** Indexes into result.questions, in paper order. */
  indices: number[];
  right: number;
  /** This paper's mark on the board's scale (JAMB: out of 100). */
  mark: number;
};

export type ResultMarks = {
  papers: ResultPaper[];
  /** Each paper's maximum (JAMB 100, UI Post-UTME 25). */
  paperMax: number;
  total: number;
  totalMax: number;
  right: number;
  wrong: number;
  blank: number;
};

/**
 * Marks the way the board does. A full exam is scored out of
 * `targetScoreMax` (JAMB 400, UI Post-UTME 100) across `maxSubjects` papers,
 * so one paper is worth targetScoreMax / maxSubjects: JAMB 100, UI 25.
 * A sitting with fewer papers is out of that many papers' worth.
 */
export function computeMarks(
  questions: QuestionWithAnswer[],
  scale: { targetScoreMax: number; maxSubjects: number } | null,
): ResultMarks {
  const order: string[] = [];
  const bySubject = new Map<string, number[]>();
  questions.forEach((q, i) => {
    if (!bySubject.has(q.subject)) {
      bySubject.set(q.subject, []);
      order.push(q.subject);
    }
    bySubject.get(q.subject)!.push(i);
  });

  const paperMax = scale ? scale.targetScoreMax / Math.max(1, scale.maxSubjects) : 100;
  let right = 0;
  let wrong = 0;
  let blank = 0;
  const papers = order.map((subject) => {
    const indices = bySubject.get(subject)!;
    let r = 0;
    for (const i of indices) {
      const st = statusOf(questions[i]);
      if (st === "r") r++;
      else if (st === "w") wrong++;
      else blank++;
    }
    right += r;
    return { subject, indices, right: r, mark: Math.round((r / Math.max(1, indices.length)) * paperMax) };
  });

  return {
    papers,
    paperMax,
    total: papers.reduce((t, p) => t + p.mark, 0),
    totalMax: Math.round(paperMax * papers.length),
    right,
    wrong,
    blank,
  };
}

export function formatDuration(seconds: number): string {
  const sec = Math.max(0, Math.round(seconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (h ? `${h}:` : "") + `${String(m).padStart(h ? 2 : 1, "0")}:${String(s).padStart(2, "0")}`;
}
