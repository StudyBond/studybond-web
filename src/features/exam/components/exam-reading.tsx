"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Flag, X } from "lucide-react";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { useExamStore, type OptionKey } from "@/features/exam/stores/exam-store";
import { optionsOf, sharedGroup } from "@/features/exam/lib/options";
import type { ExamQuestion } from "@/lib/api/types";
import { displayImageUrl } from "@/lib/utils/image-url";
import { cn } from "@/lib/utils/cn";

import s from "./exam-shell.module.css";

function ProtectedImg({ src, alt, className, onZoom }: { src: string; alt: string; className: string; onZoom: (src: string) => void }) {
  const url = displayImageUrl(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={cn(className, "sb-protected-img")}
      loading="lazy"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        e.stopPropagation();
        onZoom(url);
      }}
    />
  );
}

type ExamReadingProps = {
  questions: ExamQuestion[];
  index: number;
  /** "Physics" */
  paperName: string;
  numberInPaper: number;
  paperCount: number;
  /** Where the paper starts, to number a shared group in paper terms. */
  paperStart: number;
};

/**
 * The middle band: the question alone, vertically centred. When it has a
 * passage, a shared diagram or its own picture, that sits in a pane beside
 * it on a laptop (>= 1024px). A passage or shared diagram stays put across
 * the questions that share it. Narrower, a passage becomes Passage/Question
 * tabs, and a question's own picture sits above it.
 */
export function ExamReading({ questions, index, paperName, numberInPaper, paperCount, paperStart }: ExamReadingProps) {
  const question = questions[index];
  const state = useExamStore((st) => st.questionStates.get(question.id));
  const setAnswer = useExamStore((st) => st.setAnswer);
  const toggleFlag = useExamStore((st) => st.toggleFlag);
  const selected = state?.answer ?? null;
  const flagged = state?.flagged ?? false;

  const group = sharedGroup(questions, index);
  const groupKey = group ? `${questions[group.start].id}` : null;
  const hasStimulus = !!group;
  const ownPicture = question.imageUrl;
  // Own picture in the pane only when no passage/diagram already holds it.
  const pictureInPane = !hasStimulus && !!ownPicture;
  const paired = hasStimulus || pictureInPane;

  // Tabs (narrow screens only): the first time you reach a passage, it
  // opens on the passage; after that, on the question.
  const [view, setView] = useState({
    id: question.id,
    index,
    dir: "",
    tab: groupKey ? ("p" as const) : ("q" as const),
    seen: groupKey ? [groupKey] : ([] as string[]),
  });
  if (view.id !== question.id) {
    const fresh = !!groupKey && !view.seen.includes(groupKey);
    setView({
      id: question.id,
      index,
      dir: index > view.index ? s.inNext : index < view.index ? s.inPrev : "",
      tab: fresh ? "p" : "q",
      seen: fresh ? [...view.seen, groupKey] : view.seen,
    });
  }
  const tab = view.tab;
  const setTab = (t: "p" | "q") => setView((v) => ({ ...v, tab: t }));

  const [zoom, setZoom] = useState<string | null>(null);
  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setZoom(null);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [zoom]);

  const options = optionsOf(question);
  const asTiles = options.some((o) => o.image);
  const pick = (key: OptionKey) => setAnswer(question.id, selected === key ? null : key);

  const groupLabel = group
    ? `${paperName} ${group.start - paperStart + 1}–${group.end - paperStart + 1}`
    : null;
  const stimulusTitle = question.parentQuestionText ? "Passage" : "Diagram";

  const pane = hasStimulus ? (
    <section className={cn(s.pane, tab === "q" && s.paneOff)} aria-label={stimulusTitle}>
      <div className={s.paneHead}>
        <b>{stimulusTitle}</b>
        <span>{groupLabel}</span>
      </div>
      {question.parentQuestionText ? (
        <div className={s.paneBody}>
          <MathMarkdown content={question.parentQuestionText} />
        </div>
      ) : null}
      {question.parentQuestionImageUrl ? (
        <ProtectedImg
          src={question.parentQuestionImageUrl}
          alt="Diagram for these questions"
          className={s.paneImg}
          onZoom={setZoom}
        />
      ) : null}
      <div className={s.paneBack}>
        <button type="button" className={s.btn} onClick={() => setTab("q")}>
          Back to question {numberInPaper}
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </div>
    </section>
  ) : pictureInPane && ownPicture ? (
    <section className={cn(s.pane, s.picturePane)} aria-label="Picture for this question">
      <ProtectedImg src={ownPicture} alt="Picture for this question" className={s.paneImg} onZoom={setZoom} />
    </section>
  ) : null;

  const questionColumn = (
    <div key={question.id} className={cn(s.qwrap, view.dir, hasStimulus && tab === "p" && s.paneOff)}>
      <div className={s.qhead}>
        <span className={s.qnum}>
          <b>
            {paperName} {numberInPaper}
          </b>{" "}
          of {paperCount}
        </span>
        {question.topic ? <span className={s.qtopic}>{question.topic}</span> : null}
        <button type="button" className={s.flagBtn} aria-pressed={flagged} onClick={() => toggleFlag(question.id)}>
          <Flag aria-hidden="true" />
          <span>{flagged ? "Marked" : "Mark for review"}</span>
        </button>
      </div>

      <div className={cn(s.qtext, "sb-protected")}>
        <MathMarkdown content={question.questionText} variant="question" />
      </div>
      {ownPicture && !pictureInPane ? (
        <ProtectedImg src={ownPicture} alt="Picture for this question" className={s.qimg} onZoom={setZoom} />
      ) : null}

      <div className={asTiles ? s.tiles : s.opts} role="radiogroup" aria-label="Options">
        {options.map((o) => {
          const on = selected === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              className={cn(asTiles ? s.tile : s.opt, on && s.optOn)}
              onClick={() => pick(o.key)}
            >
              <span className={s.optKey}>{o.key}</span>
              {asTiles && o.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImageUrl(o.image)}
                  alt={`Option ${o.key}`}
                  className="sb-protected-img"
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : null}
              {o.text ? (
                <span className={cn(s.optText, "sb-protected")}>
                  <MathMarkdown content={o.text} variant="option" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className={s.hint}>
        <kbd className={s.kbd}>A</kbd>–<kbd className={s.kbd}>{options[options.length - 1]?.key ?? "D"}</kbd> choose ·{" "}
        <kbd className={s.kbd}>N</kbd> next · <kbd className={s.kbd}>P</kbd> back · <kbd className={s.kbd}>F</kbd> mark ·{" "}
        <kbd className={s.kbd}>S</kbd> submit
      </p>
    </div>
  );

  return (
    <main className={cn(s.body, paired && s.bodyPaired, pictureInPane && s.pictureLayout, "sb-exam-content")}>
      <div className={cn(s.wrap, paired && s.wrapPaired, "sb-protected")}>
        {hasStimulus ? (
          <div className={s.tabs} role="tablist">
            <button type="button" role="tab" aria-selected={tab === "p"} onClick={() => setTab("p")}>
              {stimulusTitle}
            </button>
            <button type="button" role="tab" aria-selected={tab === "q"} onClick={() => setTab("q")}>
              Question {numberInPaper}
            </button>
          </div>
        ) : null}
        {paired ? (
          <div className={s.panes}>
            {pane}
            {questionColumn}
          </div>
        ) : (
          questionColumn
        )}
      </div>

      {zoom ? (
        <div className={s.zoom} onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label="Picture, enlarged">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Enlarged picture" className="sb-protected-img" draggable={false} onContextMenu={(e) => e.preventDefault()} />
          <button type="button" className={cn(s.iconBtn, s.zoomClose)} onClick={() => setZoom(null)} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </main>
  );
}
