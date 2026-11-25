"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MoveHorizontal, RotateCcw, Share2, X } from "lucide-react";

import { ShareSheet } from "@/features/duel/share/share-sheet";
import { ReviewCard } from "@/features/exam/components/review-card";
import { useRetake } from "@/features/exam/components/retake-button";
import { TextSizeButton } from "@/features/exam/components/text-size-picker";
import { useExamPrefs, useSyncExamPrefs } from "@/features/exam/stores/exam-prefs-store";
import { FLAT_COLOUR, paperColours, paperLabel } from "@/features/exam/lib/papers";
import { sharedGroup } from "@/features/exam/lib/options";
import { STATUS_WORD, computeMarks, formatDuration, statusOf, type Status } from "@/features/exam/lib/results";
import { noteSwipeHintShown, noteSwiped, shouldShowSwipeHint } from "@/features/exam/lib/swipe-hint";
import { noteTapHintShown, noteTapped, shouldShowTapHint } from "@/features/exam/lib/tap-hint";
import { textScale } from "@/features/exam/lib/text-size";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { ExamResult } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import tk from "./exam-tokens.module.css";
import s from "./results.module.css";

type Filter = "all" | "w" | "b";

const PHONE = "(max-width: 560px)";
function useIsPhone(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(PHONE);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

type ResultsViewProps = {
  result: ExamResult;
  examId: number;
  /** The review is in its restricted phase after screenshot attempts. */
  restricted: boolean;
};

/**
 * The results screen: the mark on the board's scale (JAMB out of 400, each
 * paper out of 100), a row of ticks per paper, then the review. On a laptop
 * the review sits beside a question picker; on a phone a question opens in a
 * drawer, and a sideways swipe moves between questions. N / P (or the arrow
 * keys) move too, following the active filter.
 */
export function ResultsView({ result, examId, restricted }: ResultsViewProps) {
  const questions = result.questions;
  const isStudy = result.examType === "STUDY";
  const { data: profile } = useExamProfile();
  useSyncExamPrefs();
  const paperColourOn = useExamPrefs((p) => p.paperColour);
  const textSize = useExamPrefs((p) => p.textSize);
  const isPhone = useIsPhone();
  const { retake, isLoading: retaking } = useRetake(examId);
  const [shareOpen, setShareOpen] = useState(false);

  const marks = useMemo(
    () =>
      computeMarks(
        questions,
        profile ? { targetScoreMax: profile.targetScoreMax, maxSubjects: profile.maxSubjects } : null,
      ),
    [questions, profile],
  );
  const statuses = useMemo(() => questions.map(statusOf), [questions]);
  const paperOf = useMemo(() => {
    const map = new Array<number>(questions.length).fill(0);
    marks.papers.forEach((p, k) => p.indices.forEach((i) => (map[i] = k)));
    return map;
  }, [marks.papers, questions.length]);
  const tints = useMemo(() => {
    const own = paperColours(marks.papers.map((p) => p.subject));
    return paperColourOn ? own : own.map(() => FLAT_COLOUR);
  }, [marks.papers, paperColourOn]);

  // ─── Which question is open ───
  const [view, setView] = useState(() => {
    const firstWrong = statuses.indexOf("w");
    const idx = firstWrong >= 0 ? firstWrong : 0;
    return { idx, paper: paperOf[idx] ?? 0, filter: "all" as Filter, drawer: false, dir: "" };
  });
  const busy = useRef(false);
  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  const matches = useCallback((i: number, f: Filter) => f === "all" || statuses[i] === f, [statuses]);

  const step = useCallback(
    (d: 1 | -1) => {
      setView((v) => {
        const n = questions.length;
        let i = v.idx;
        for (let k = 0; k < n; k++) {
          i = (i + d + n) % n;
          if (matches(i, v.filter)) break;
        }
        return { ...v, idx: i, paper: paperOf[i] ?? 0, dir: d > 0 ? s.inNext : s.inPrev };
      });
    },
    [matches, paperOf, questions.length],
  );

  // ─── The swipe hint (phone): "in" shows it, "out" fades it, null is gone ───
  const [tip, setTip] = useState<"in" | "out" | null>(null);
  const tipTimers = useRef<number[]>([]);
  const clearTip = useCallback(() => {
    tipTimers.current.forEach((t) => window.clearTimeout(t));
    tipTimers.current = [];
    setTip(null);
  }, []);
  useEffect(() => () => tipTimers.current.forEach((t) => window.clearTimeout(t)), []);
  const onSwiped = useCallback(() => {
    noteSwiped();
    clearTip();
  }, [clearTip]);

  // ─── The tap hint (phone): question 1 pulses once the grid is in sight ───
  const gridRef = useRef<HTMLDivElement>(null);
  const [tapTip, setTapTip] = useState<"in" | "out" | null>(null);
  const tapTimers = useRef<number[]>([]);
  useEffect(() => {
    const grid = gridRef.current;
    if (!isPhone || !grid || !shouldShowTapHint()) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        seen.disconnect();
        noteTapHintShown();
        setTapTip("in");
        tapTimers.current = [
          window.setTimeout(() => setTapTip("out"), 6500),
          window.setTimeout(() => setTapTip(null), 6800),
        ];
      },
      { threshold: 0.6 },
    );
    seen.observe(grid);
    return () => {
      seen.disconnect();
      tapTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, [isPhone]);

  const select = (i: number) => {
    if (isPhone) {
      noteTapped();
      tapTimers.current.forEach((t) => window.clearTimeout(t));
      setTapTip(null);
    }
    setView((v) => ({ ...v, idx: i, paper: paperOf[i] ?? 0, drawer: isPhone, dir: "" }));
    if (isPhone && !view.drawer && shouldShowSwipeHint()) {
      noteSwipeHintShown();
      clearTip();
      setTip("in");
      tipTimers.current = [
        window.setTimeout(() => setTip("out"), 4600),
        window.setTimeout(() => setTip(null), 4900),
      ];
    }
  };
  const closeDrawer = () => {
    clearTip();
    setView((v) => ({ ...v, drawer: false }));
  };

  const setFilter = (f: Filter) =>
    setView((v) => {
      if (matches(v.idx, f)) return { ...v, filter: f };
      const n = questions.length;
      let i = v.idx;
      for (let k = 0; k < n; k++) {
        i = (i + 1) % n;
        if (matches(i, f)) break;
      }
      return { ...v, filter: f, idx: i, paper: paperOf[i] ?? 0, dir: "" };
    });

  // ─── Keys: N / → next, P / ← previous ───
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || busy.current || shareOpen) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const key = e.key.toLowerCase();
      if (key === "n" || e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (key === "p" || e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape" && view.drawer) {
        setView((v) => ({ ...v, drawer: false }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, shareOpen, view.drawer]);

  // ─── Keep the open question in sight ───
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const drawerScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    drawerScrollRef.current?.scrollTo({ top: 0 });
    const box = scrollRef.current;
    const card = cardRef.current;
    if (!box || !card || isPhone) return;
    const top = card.getBoundingClientRect().top - box.getBoundingClientRect().top;
    if (top < 0 || top > box.clientHeight * 0.6) box.scrollTop += top - 10;
  }, [view.idx, isPhone]);

  // ─── The slip ───
  const total = isStudy ? marks.right : marks.total;
  const totalMax = isStudy ? questions.length : marks.totalMax;
  const ranked = marks.papers.map((p, k) => ({ ...p, k })).sort((a, b) => b.mark - a.mark);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const blankClause = (lead: string) => (marks.blank ? `${lead}${plural(marks.blank, "blank answer")} scored zero.` : ".");
  let note: ReactNode;
  if (marks.papers.length >= 2 && best && worst && best.mark !== worst.mark) {
    note = (
      <>
        <b>{paperLabel(best.subject)}</b> carried you at {best.mark}. <b>{paperLabel(worst.subject)}</b> at {worst.mark}{" "}
        is where the marks are hiding{blankClause(", and ")}
      </>
    );
  } else if (marks.papers.length >= 2 && best) {
    note = (
      <>
        Every paper scored <b>{best.mark}</b>
        {blankClause(", and ")}
      </>
    );
  } else {
    note = (
      <>
        You got <b>{marks.right}</b> of {questions.length} right{blankClause(". ")}
      </>
    );
  }
  const date = new Date(result.completedAt);
  const kicker = [
    isStudy ? "Study session" : result.displayNameLong.replace(/\s*•\s*/g, " · "),
    Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  ]
    .filter(Boolean)
    .join(" · ");

  // ─── The open question ───
  const idx = view.idx;
  const q = questions[idx];
  const k = paperOf[idx] ?? 0;
  const paper = marks.papers[k];
  const positionIn = (i: number) => marks.papers[paperOf[i] ?? 0].indices.indexOf(i) + 1;
  const group = q ? sharedGroup(questions, idx) : null;
  const groupLabel = group
    ? `${paperLabel(paper.subject)} ${positionIn(group.start)}–${positionIn(group.end)}`
    : null;
  const filterWord = view.filter === "w" ? " wrong" : view.filter === "b" ? " blank" : "";
  const gridPaper = marks.papers[view.paper] ?? paper;

  const card = (inDrawer: boolean) =>
    q ? (
      <ReviewCard
        key={q.id}
        ref={inDrawer ? undefined : cardRef}
        q={q}
        paperName={paperLabel(paper.subject)}
        numberInPaper={positionIn(idx)}
        tint={tints[k]}
        groupLabel={groupLabel}
        dirClass={view.dir}
        filterWord={filterWord}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        swipe={inDrawer}
        onSwiped={onSwiped}
        onBusyChange={setBusy}
      />
    ) : (
      <p className={s.empty}>There are no questions to show.</p>
    );

  return (
    <div className={cn(tk.tokens, s.page)} style={{ "--ts": textScale(textSize) } as CSSProperties}>
      <header className={s.bar}>
        <Link href="/dashboard" className={s.back}>
          <ArrowLeft aria-hidden="true" />
          <span>Dashboard</span>
        </Link>
        <span className={s.spacer} />
        <TextSizeButton buttonClassName={s.iconBtn} />
        {!isStudy ? (
          <button type="button" className={cn(s.btn, s.btnGhost)} onClick={() => setShareOpen(true)} aria-label="Share result">
            <Share2 aria-hidden="true" />
            <span className={s.hideSm}>Share result</span>
          </button>
        ) : null}
        {isStudy ? (
          <Link href={"/dashboard/study" as Route} className={cn(s.btn, s.btnPrimary)}>
            New study session
          </Link>
        ) : (
          <button type="button" className={cn(s.btn, s.btnPrimary)} onClick={retake} disabled={retaking} aria-busy={retaking}>
            <RotateCcw aria-hidden="true" />
            <span>{retaking ? "Starting…" : "Retake"}</span>
          </button>
        )}
      </header>

      <div className={cn(s.scroll, "sb-exam-content")} ref={scrollRef}>
        <div className={s.wrap}>
          {restricted ? (
            <p className={s.banner} role="status">
              <span>
                <b>Restricted review.</b> Another screenshot attempt will lock this review for longer each time.
              </span>
            </p>
          ) : null}

          <section className={s.slip} aria-label="Your result">
            <div>
              <p className={s.kicker}>{kicker}</p>
              <div className={s.score}>
                <b>{total}</b>
                <span>/ {totalMax}</span>
              </div>
              <p className={s.note}>{note}</p>
              <dl className={s.facts}>
                <div>
                  <dt>Time used</dt>
                  <dd>{formatDuration(result.timeTakenSeconds)}</dd>
                </div>
                <div>
                  <dt>Right</dt>
                  <dd>
                    {marks.right}
                    <small> of {questions.length}</small>
                  </dd>
                </div>
                <div>
                  <dt>Points earned</dt>
                  <dd className={s.sp}>
                    +{result.spEarned} SP
                    {result.spMultiplier > 1 ? <small> ×{result.spMultiplier}</small> : null}
                  </dd>
                </div>
              </dl>
            </div>

            <div className={s.papers}>
              {marks.papers.map((p, pk) => (
                <div key={p.subject} className={s.prow} style={{ "--tint": tints[pk] } as CSSProperties}>
                  <button
                    type="button"
                    className={s.pname}
                    onClick={() => setView((v) => ({ ...v, paper: pk }))}
                    aria-label={`Show ${paperLabel(p.subject)} in the review list`}
                  >
                    <i className={s.dot} />
                    {paperLabel(p.subject)}
                  </button>
                  {/* Mouse shortcut into the review; the picker below is the keyboard way in. */}
                  <span className={s.ticks} aria-hidden="true">
                    {p.indices.map((i, n) => (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        className={cn(s.tk, s[statuses[i]], i === idx && s.sel)}
                        title={`${paperLabel(p.subject)} ${n + 1}: ${STATUS_WORD[statuses[i]]}`}
                        onClick={() => select(i)}
                      />
                    ))}
                  </span>
                  <span className={s.pmark}>
                    {isStudy ? p.right : p.mark}
                    <small>/{isStudy ? p.indices.length : marks.paperMax}</small>
                  </span>
                </div>
              ))}
              <div className={s.legend} aria-hidden="true">
                <span>
                  <i className={s.r} />
                  Correct
                </span>
                <span>
                  <i className={s.w} />
                  Wrong
                </span>
                <span>
                  <i className={s.b} />
                  No answer
                </span>
              </div>
            </div>
          </section>

          <div className={s.review}>
            <aside className={s.pick} aria-label="Pick a question">
              <div className={s.pickHead}>
                <h2>Go through them</h2>
                {isPhone ? <p className={s.pickHint}>Tap a number to see the answer and why.</p> : null}
                {marks.papers.length > 1 ? (
                  <div className={s.pickPapers}>
                    {marks.papers.map((p, pk) => (
                      <button
                        key={p.subject}
                        type="button"
                        aria-pressed={view.paper === pk}
                        onClick={() => setView((v) => ({ ...v, paper: pk }))}
                      >
                        <span>{paperLabel(p.subject)}</span>
                        <span className={s.num}>
                          {p.right}/{p.indices.length}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className={s.seg} role="group" aria-label="Show">
                  {(
                    [
                      ["all", "All", questions.length],
                      ["w", `Wrong ${marks.wrong}`, marks.wrong],
                      ["b", `Blank ${marks.blank}`, marks.blank],
                    ] as Array<[Filter, string, number]>
                  ).map(([f, label, count]) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={view.filter === f}
                      disabled={f !== "all" && count === 0}
                      onClick={() => setFilter(f)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.grid} ref={gridRef}>
                {tapTip ? (
                  <p className={cn(s.tapTip, tapTip === "out" && s.tapTipOut)} role="status">
                    Tap to see the explanation
                  </p>
                ) : null}
                {gridPaper?.indices.map((i, n) => {
                  const st: Status = statuses[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      className={cn(
                        s.rq,
                        s[st],
                        i === idx && s.sel,
                        !matches(i, view.filter) && s.dim,
                        n === 0 && tapTip === "in" && s.pulse,
                      )}
                      aria-current={i === idx ? "true" : undefined}
                      aria-label={`${paperLabel(gridPaper.subject)} ${n + 1}: ${STATUS_WORD[st]}`}
                      onClick={() => select(i)}
                    >
                      {n + 1}
                    </button>
                  );
                })}
              </div>
            </aside>

            {!isPhone ? <div className={s.dock}>{card(false)}</div> : null}
          </div>
        </div>
      </div>

      {view.drawer && isPhone ? (
        <div className={s.drawer} onClick={closeDrawer}>
          <div
            className={s.drawerPanel}
            role="dialog"
            aria-modal="true"
            aria-label={`${paperLabel(paper.subject)} ${positionIn(idx)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={s.drawerBar}>
              <h2>
                {paperLabel(paper.subject)} {positionIn(idx)}
              </h2>
              <TextSizeButton buttonClassName={s.iconBtn} />
              <span className={s.drawerStep}>
                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => step(-1)}
                  aria-label={`Previous${filterWord} question`}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => step(1)}
                  aria-label={`Next${filterWord} question`}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </span>
              <button type="button" className={s.iconBtn} onClick={closeDrawer} aria-label="Close">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className={s.drawerScroll} ref={drawerScrollRef}>
              <div className={tip ? s.nudge : undefined}>{card(true)}</div>
            </div>
            {tip ? (
              <p className={cn(s.swipeTip, tip === "out" && s.swipeTipOut)} role="status">
                <MoveHorizontal aria-hidden="true" />
                Swipe to move between questions
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isStudy ? <ShareSheet examId={examId} open={shareOpen} onClose={() => setShareOpen(false)} /> : null}
    </div>
  );
}
