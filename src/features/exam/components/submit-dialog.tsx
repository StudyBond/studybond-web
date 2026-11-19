"use client";

import { useEffect, useMemo, type CSSProperties } from "react";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { useNow } from "@/features/exam/hooks/use-exam-tick";
import { FLAT_COLOUR, paperLabel, secondsInPaper } from "@/features/exam/lib/papers";
import { cn } from "@/lib/utils/cn";

import s from "./exam-shell.module.css";

type SubmitDialogProps = {
  onConfirm: () => void;
  isSubmitting: boolean;
  /** In a duel: the rival's first name, for "Tobi can't see your score…". */
  duelRivalName?: string | null;
  /** One tint per paper, as in the rail. */
  tints?: string[];
};

/** [3, 4, 5, 9] -> [[3, 5], [9, 9]] */
function runs(list: number[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const n of list) {
    const last = out[out.length - 1];
    if (last && n === last[1] + 1) last[1] = n;
    else out.push([n, n]);
  }
  return out;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * The submit check: each paper's blank questions as chips that jump straight
 * to them, then the ones marked for review, and the time left. Rendered
 * inside the exam shell, whose styles it uses.
 */
export function SubmitDialog({ onConfirm, isSubmitting, duelRivalName, tints }: SubmitDialogProps) {
  const open = useExamStore((st) => st.submitDialogOpen);
  const setOpen = useExamStore((st) => st.setSubmitDialogOpen);
  const states = useExamStore((st) => st.questionStates);
  const ranges = useExamStore((st) => st.subjectRanges);
  const remaining = useExamStore((st) => st.remainingSeconds);
  const goToQuestion = useExamStore((st) => st.goToQuestion);
  const now = useNow();

  // The store keeps question states in paper order.
  const questionIds = useMemo(() => [...states.keys()], [states]);

  useEffect(() => {
    if (!open || isSubmitting) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, isSubmitting, setOpen]);

  if (!open) return null;

  const papers =
    ranges.length > 0
      ? ranges
      : [{ subject: "Paper", startIndex: 0, endIndex: questionIds.length - 1, count: questionIds.length }];

  const rows = papers.map((range, k) => {
    const blank: number[] = [];
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      if (!states.get(questionIds[i])?.answer) blank.push(i - range.startIndex);
    }
    return { range, k, blank, mins: Math.round(secondsInPaper(range, questionIds, states, now) / 60) };
  });
  const blankTotal = rows.reduce((t, r) => t + r.blank.length, 0);
  const marked: number[] = [];
  questionIds.forEach((id, i) => {
    if (states.get(id)?.flagged) marked.push(i);
  });
  const firstBlank = questionIds.findIndex((id) => !states.get(id)?.answer);
  const worst = rows.slice().sort((a, b) => b.blank.length - a.blank.length)[0];
  const left = Math.floor(remaining / 60);

  const placeOf = (i: number) => {
    const r = papers.find((p) => i >= p.startIndex && i <= p.endIndex) ?? papers[0];
    return `${paperLabel(r.subject)} ${i - r.startIndex + 1}`;
  };
  const go = (i: number) => {
    goToQuestion(i);
    setOpen(false);
  };

  const head =
    blankTotal === 0
      ? "Every question has an answer"
      : worst && worst.blank.length === worst.range.count && rows.length > 1
        ? `${paperLabel(worst.range.subject)} has not been started`
        : `${plural(blankTotal, "question")} still blank`;

  return (
    <div className={s.scrim} onClick={() => !isSubmitting && setOpen(false)}>
      <div
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-check-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="submit-check-title">{head}</h2>
        <p className={s.lede}>
          {blankTotal ? (
            <>
              You have <b>{plural(left, "minute")}</b> for <b>{plural(blankTotal, "question")}</b>. A blank answer
              scores zero, so a guess is always worth more.
            </>
          ) : (
            <>
              You have <b>{plural(left, "minute")}</b> left. Check the ones you marked, or submit now.
            </>
          )}
          {duelRivalName ? ` ${duelRivalName} can't see your score until you both finish.` : null}
        </p>

        <div className={s.sheetRows}>
          {rows.map((r) => (
            <div
              key={r.range.subject}
              className={s.sheetRow}
              style={{ "--tint": tints?.[r.k] ?? FLAT_COLOUR } as CSSProperties}
            >
              <span className={s.sheetName}>
                <i className={s.dot} />
                {paperLabel(r.range.subject)}
              </span>
              <span className={s.chips}>
                {r.blank.length === 0 ? (
                  <span className={s.chipNone}>All answered</span>
                ) : r.blank.length === r.range.count ? (
                  <button type="button" className={s.chip} onClick={() => go(r.range.startIndex)}>
                    Not started
                  </button>
                ) : (
                  runs(r.blank).map(([a, z]) => (
                    <button
                      key={a}
                      type="button"
                      className={s.chip}
                      onClick={() => go(r.range.startIndex + a)}
                      aria-label={`Go to ${paperLabel(r.range.subject)} ${a + 1}`}
                    >
                      {a + 1}
                      {z > a ? `–${z + 1}` : ""}
                    </button>
                  ))
                )}
              </span>
              <span className={s.sheetCount}>
                <b>{r.mins}</b> min
              </span>
            </div>
          ))}
          {marked.length ? (
            <div className={s.sheetRow} style={{ "--tint": "var(--amber)" } as CSSProperties}>
              <span className={s.sheetName}>
                <i className={s.dot} />
                Marked
              </span>
              <span className={s.chips}>
                {marked.map((i) => (
                  <button key={i} type="button" className={s.chip} onClick={() => go(i)}>
                    {placeOf(i)}
                  </button>
                ))}
              </span>
              <span className={s.sheetCount} />
            </div>
          ) : null}
        </div>

        <div className={s.dialogActions}>
          {firstBlank >= 0 ? (
            <button type="button" className={cn(s.btn, s.btnGhost)} onClick={() => go(firstBlank)} disabled={isSubmitting}>
              Go to first blank
            </button>
          ) : (
            <button type="button" className={cn(s.btn, s.btnGhost)} onClick={() => setOpen(false)} disabled={isSubmitting}>
              Keep checking
            </button>
          )}
          <button
            type="button"
            className={cn(s.btn, s.btnPrimary)}
            onClick={onConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit now"}
          </button>
        </div>
      </div>
    </div>
  );
}
