"use client";

import { forwardRef, useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ExplanationView } from "@/features/exam/components/explanation-view";
import { ReportQuestionModal } from "@/features/exam/components/report-question-modal";
import { splitNote } from "@/features/exam/lib/notes";
import { optionsOf } from "@/features/exam/lib/options";
import { softColour } from "@/features/exam/lib/papers";
import { statusOf } from "@/features/exam/lib/results";
import type { QuestionWithAnswer } from "@/lib/api/types";
import { displayImageUrl } from "@/lib/utils/image-url";
import { cn } from "@/lib/utils/cn";

import s from "./results.module.css";

const VERDICT = { r: "Correct", w: "Wrong", b: "No answer" } as const;

/** A swipe only counts when it is clearly sideways, so scrolling still works. */
const SWIPE_MIN = 60;
const SWIPE_RATIO = 1.6;

/**
 * True when the finger landed on something that scrolls sideways (a wide
 * table, a long sum), or outside the card itself (the zoomed picture and the
 * report form are portals, so their touches still bubble here). Dragging
 * there must scroll or pan, never change the question. Same when the page is
 * pinch-zoomed: a sideways drag then moves along the line being read.
 */
function swipeBlocked(target: EventTarget | null, card: HTMLElement): boolean {
  if ((window.visualViewport?.scale ?? 1) > 1.01) return true;
  if (!(target instanceof Element) || !card.contains(target)) return true;
  for (let el: Element | null = target; el && el !== card; el = el.parentElement) {
    if (el.scrollWidth > el.clientWidth + 1) {
      const ox = getComputedStyle(el).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
  }
  return false;
}

type ReviewCardProps = {
  q: QuestionWithAnswer;
  paperName: string;
  numberInPaper: number;
  tint: string;
  /** "English 6–10" when this question shares a passage or diagram. */
  groupLabel: string | null;
  /** Animation class for the direction of travel. */
  dirClass: string;
  /** " wrong" / " blank" when a filter is on: "Next wrong". */
  filterWord: string;
  onPrev: () => void;
  onNext: () => void;
  /** Phone only: swipe left/right on the card to move. */
  swipe: boolean;
  /** Called after a swipe moved the review (not after a button press). */
  onSwiped?: () => void;
  /** Tells the page a dialog is open, so arrow keys leave the review alone. */
  onBusyChange: (busy: boolean) => void;
};

function Pic({ src, alt, className, onZoom }: { src: string; alt: string; className: string; onZoom: (src: string) => void }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displayImageUrl(src)}
      alt={alt}
      className={cn(className, "sb-protected-img")}
      loading="lazy"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => onZoom(src)}
    />
  );
}

/** One question, reviewed: verdict, the question, the options marked, the explanation. */
export const ReviewCard = forwardRef<HTMLElement, ReviewCardProps>(function ReviewCard(
  { q, paperName, numberInPaper, tint, groupLabel, dirClass, filterWord, onPrev, onNext, swipe, onSwiped, onBusyChange },
  ref,
) {
  const [zoom, setZoom] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const st = statusOf(q);
  // The paper and year go in the grey line; a real sentence goes after the working.
  const note = splitNote(q.explanation?.markedNotes ?? q.explanation?.additionalNotes);

  useEffect(() => {
    onBusyChange(!!zoom || reportOpen);
    return () => onBusyChange(false);
  }, [zoom, reportOpen, onBusyChange]);

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    const t = e.touches[0];
    // A second finger means a pinch, not a swipe.
    const ok = t && e.touches.length === 1 && !zoom && !reportOpen && !swipeBlocked(e.target, e.currentTarget);
    touch.current = ok ? { x: t.clientX, y: t.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < SWIPE_RATIO * Math.abs(dy)) return;
    if (dx < 0) onNext();
    else onPrev();
    onSwiped?.();
  };

  const tagFor = (key: string) => {
    const isKey = q.correctAnswer === key;
    const isMine = q.userAnswer === key;
    if (isMine && isKey) return "Your answer";
    if (isMine) return "You picked this";
    if (isKey) return "Correct";
    return "";
  };

  return (
    <article
      ref={ref}
      className={cn(s.card, dirClass)}
      // The paper's colour: its dot, and the option-letter badges in the explanation.
      style={{ "--tint": tint, "--paper": tint, "--paper-s": softColour(tint) } as CSSProperties}
      aria-label={`${paperName} ${numberInPaper}, ${VERDICT[st].toLowerCase()}`}
      onTouchStart={swipe ? onTouchStart : undefined}
      onTouchEnd={swipe ? onTouchEnd : undefined}
    >
      <div className={s.meta}>
        <span className={cn(s.verdict, s[st])}>{VERDICT[st]}</span>
        <span className={s.metaPaper}>
          <i className={s.dot} />
          {paperName} {numberInPaper}
        </span>
        {q.topic ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{q.topic}</span>
          </>
        ) : null}
      </div>

      {q.parentQuestionText || q.parentQuestionImageUrl ? (
        <details className={s.passage}>
          <summary>
            {q.parentQuestionText ? "Passage" : "Diagram"}
            {groupLabel ? ` — ${groupLabel}` : ""}
          </summary>
          <div className={cn(s.passageBody, "sb-protected")}>
            {q.parentQuestionText ? <MathMarkdown content={q.parentQuestionText} /> : null}
            {q.parentQuestionImageUrl ? (
              <Pic src={q.parentQuestionImageUrl} alt="Diagram for these questions" className="" onZoom={setZoom} />
            ) : null}
          </div>
        </details>
      ) : null}

      <div className={cn(s.qtext, "sb-protected")}>
        <MathMarkdown content={q.questionText} variant="question" />
      </div>
      {q.imageUrl ? <Pic src={q.imageUrl} alt="Picture for this question" className={s.qimg} onZoom={setZoom} /> : null}

      <div className={s.opts}>
        {optionsOf(q).map((o) => {
          const isKey = q.correctAnswer === o.key;
          const isMine = q.userAnswer === o.key;
          return (
            <div key={o.key} className={cn(s.opt, isKey ? s.key : isMine ? s.miss : null)}>
              <span className={s.optKey}>{o.key}</span>
              <span className={cn(s.optText, "sb-protected")}>
                {o.text ? <MathMarkdown content={o.text} variant="option" /> : null}
                {o.image ? <Pic src={o.image} alt={`Option ${o.key}`} className="" onZoom={setZoom} /> : null}
              </span>
              <span className={s.tag}>{tagFor(o.key)}</span>
            </div>
          );
        })}
      </div>

      <ExplanationView
        text={q.explanation?.text}
        markedText={q.explanation?.markedText}
        correct={q.correctAnswer}
        imageUrl={q.explanation?.imageUrl}
        remark={note.remark}
        onZoom={setZoom}
      />

      {/* "JAMB UTME 2000 · you spent 34s here", as the mockup draws it. */}
      <div className={s.foot}>
        <span>
          {note.tag}
          {note.tag && q.timeSpentSeconds !== null ? " · " : null}
          {q.timeSpentSeconds !== null ? (
            <>
              {note.tag ? "you" : "You"} spent <span className={s.num}>{q.timeSpentSeconds}s</span> here
            </>
          ) : null}
        </span>
        <button type="button" className={s.link} onClick={() => setReportOpen(true)}>
          Report a problem
        </button>
      </div>

      <div className={s.nav}>
        <button type="button" className={cn(s.btn, s.btnGhost)} onClick={onPrev}>
          <ChevronLeft aria-hidden="true" />
          Previous{filterWord}
          <kbd className={s.kbd}>P</kbd>
        </button>
        <button type="button" className={cn(s.btn, s.btnGhost)} onClick={onNext}>
          Next{filterWord}
          <ChevronRight aria-hidden="true" />
          <kbd className={s.kbd}>N</kbd>
        </button>
      </div>

      <ReportQuestionModal
        questionId={q.id}
        questionNumber={numberInPaper}
        subject={q.subject}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
      <ImageLightbox src={zoom} alt="Full size picture" onClose={() => setZoom(null)} />
    </article>
  );
});
