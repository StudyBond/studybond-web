"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { SubjectRange } from "@/features/exam/stores/exam-store";
import { useExamStore } from "@/features/exam/stores/exam-store";
import { paceIn, ribbonGroupSize, secondsInPaper, type Pace } from "@/features/exam/lib/papers";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/features/exam/hooks/use-exam-tick";

import s from "./exam-shell.module.css";

/**
 * Pace in this paper, live: re-reads the clock every second, so the tick
 * and the word move while the student sits on one question.
 */
export function usePace(range: SubjectRange, questionIds: number[], budgetSeconds: number): Pace {
  const states = useExamStore((st) => st.questionStates);
  const currentIndex = useExamStore((st) => st.currentIndex);
  const now = useNow();
  const spent = secondsInPaper(range, questionIds, states, now);
  return paceIn(spent, budgetSeconds, range.count, Math.max(0, currentIndex - range.startIndex));
}

type CellsProps = {
  range: SubjectRange;
  questionIds: number[];
  /** This paper's fair share of the clock, for the pace tick. */
  budgetSeconds: number;
  /** Global 0-based index of the rival's question, or null. */
  rivalIndex: number | null;
  rivalName: string | null;
  onGo: (index: number) => void;
};

/**
 * This paper's questions as a ruler, in groups of 10 (5 for short papers).
 * Answered cells are filled, marked ones carry a dot, the current one is
 * raised with its number. One tab stop: arrow keys, Home and End move
 * between cells, Enter or Space opens one.
 */
export function RibbonCells({ range, questionIds, budgetSeconds, rivalIndex, rivalName, onGo }: CellsProps) {
  const pace = usePace(range, questionIds, budgetSeconds);
  const states = useExamStore((st) => st.questionStates);
  const currentIndex = useExamStore((st) => st.currentIndex);
  const inPaper = currentIndex >= range.startIndex && currentIndex <= range.endIndex;
  const currentPos = inPaper ? currentIndex - range.startIndex : 0;

  // The tab stop sits on the current question until arrow keys move it;
  // when the question changes, it follows the question again.
  const anchor = range.startIndex + currentPos;
  const [focus, setFocus] = useState({ anchor, pos: currentPos });
  const focusPos = focus.anchor === anchor ? focus.pos : currentPos;
  const setFocusPos = (pos: number) => setFocus({ anchor, pos });
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    cellRefs.current[focusPos]?.focus();
  }, [focusPos]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = range.count - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(last, focusPos + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, focusPos - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    moved.current = true;
    setFocusPos(next);
  }

  const size = ribbonGroupSize(range.count);
  const groups: number[][] = [];
  for (let g = 0; g < range.count; g += size) {
    groups.push(Array.from({ length: Math.min(size, range.count - g) }, (_, k) => g + k));
  }

  return (
    <div className={s.ribGroups} role="group" aria-label="Questions in this paper" onKeyDown={onKeyDown} data-ribbon>
      {groups.map((cells) => (
        <span key={cells[0]} className={s.ribGroup} style={{ "--cols": size } as CSSProperties}>
          {cells.map((pos) => {
            const i = range.startIndex + pos;
            const st = states.get(questionIds[i]);
            const answered = !!st?.answer;
            const marked = !!st?.flagged;
            const isCurrent = i === currentIndex;
            const label = `Question ${pos + 1}, ${answered ? `answered ${st?.answer}` : "blank"}${marked ? ", marked for review" : ""}`;
            return (
              <button
                key={i}
                ref={(el) => {
                  cellRefs.current[pos] = el;
                }}
                type="button"
                tabIndex={pos === focusPos ? 0 : -1}
                className={cn(s.cell, answered && s.cellAnswered, marked && s.cellMarked, isCurrent && s.cellCurrent)}
                data-n={pos + 1}
                aria-label={label}
                aria-current={isCurrent ? "step" : undefined}
                title={label}
                onClick={() => onGo(i)}
              >
                {pos === pace.should ? (
                  <i
                    className={cn(s.pace, pace.late && s.paceLate)}
                    title={`By now you should be around question ${pos + 1}`}
                  />
                ) : null}
                {rivalIndex === i ? <i className={s.rivalBar} title={`${rivalName ?? "Your rival"} is here`} /> : null}
              </button>
            );
          })}
          <small>{cells[0] + 1}</small>
        </span>
      ))}
    </div>
  );
}

type RibbonProps = CellsProps & {
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
};

/** The bottom band on a laptop: back, the ruler, the pace word, next. */
export function QuestionRibbon({ onPrev, onNext, isFirst, isLast, ...cells }: RibbonProps) {
  const pace = usePace(cells.range, cells.questionIds, cells.budgetSeconds);
  return (
    <div className={s.ribbon}>
      <div className={s.ribEnd}>
        <button type="button" onClick={onPrev} disabled={isFirst} aria-label="Previous question">
          <ChevronLeft aria-hidden="true" />
        </button>
      </div>
      <RibbonCells {...cells} />
      <span
        className={cn(s.paceNote, pace.late && s.paceNoteLate)}
        title="The tick on the ruler is where the clock says you should be"
      >
        {pace.word}
      </span>
      <div className={s.ribEnd}>
        <button type="button" onClick={onNext} aria-label={isLast ? "Finish and check your paper" : "Next question"}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
