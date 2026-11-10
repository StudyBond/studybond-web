"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { useCreateBookmark } from "@/features/bookmarks/hooks/use-bookmarks";
import { DuelScreen } from "@/features/duel/components/duel-screen";
import { useDuelFull, useDuelHome, useRivalAnswers } from "@/features/duel/hooks/use-duel-play";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { ReportQuestionModal } from "@/features/exam/components/report-question-modal";
import { ReviewLockedPage } from "@/features/exam/components/review-locked-page";
import { SharedStimulus } from "@/features/exam/components/shared-stimulus";
import { useExamDetail } from "@/features/exam/hooks/use-exam-detail";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import { useReviewLockout } from "@/features/exam/hooks/use-review-lockout";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { RivalAnswer } from "@/lib/api/duel";
import type { QuestionWithAnswer, UserProfile } from "@/lib/api/types";
import { displayImageUrl } from "@/lib/utils/image-url";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { BackIcon, BookmarkIcon, CheckIcon, FlagIcon, LockIcon } from "../ui/icons";
import { DuelAvatar, SubjectTile, firstName } from "../ui/parts";
import v from "./review.module.css";

type Filter = "all" | "wrong" | "blank" | "beat" | "won";
const LETTERS = ["A", "B", "C", "D", "E"] as const;

export function DuelReviewPage({ code }: { code: string }) {
  return (
    <DuelScreen errorText="Could not load this review.">
      {({ profile }) => <DuelReviewLoader code={code} profile={profile} />}
    </DuelScreen>
  );
}

function DuelReviewLoader({ code, profile }: { code: string; profile: UserProfile }) {
  const duel = useDuelFull(code);
  const examId = duel.data?.myExamId ?? null;
  const exam = useExamDetail(examId ?? 0);
  const session = duel.data?.session;
  const rival = useRivalAnswers(session?.status === "COMPLETED" ? session.id : null);

  if (duel.isLoading || (examId && exam.isLoading) || rival.isLoading) {
    return <div className={cn("sb-ui", s.page)}><div className={s.loading}>Opening the answers</div></div>;
  }
  if (!session || !examId || !exam.data) {
    return <div className={cn("sb-ui", s.page)}><div className={s.loading}>We couldn&apos;t open this review.</div></div>;
  }
  if (session.status !== "COMPLETED") {
    return (
      <div className={cn("sb-ui", s.page)}>
        <div className={s.loading}>
          The answers open once the duel is marked.{" "}
          <Link href={`/exams/${examId}/results?duel=${session.code}` as Route} style={{ color: "var(--ui-mark-ink)" }}>Back to the duel</Link>
        </div>
      </div>
    );
  }
  const rivalName = firstName(session.participants.find((p) => p.userId !== profile.id)?.fullName);
  return (
    <GuardedReview
      examId={examId}
      code={session.code}
      questions={exam.data.questions}
      rivalName={rivalName}
      rivalAnswers={rival.data?.locked ? null : rival.data?.answers ?? []}
      profile={profile}
    />
  );
}

/** The same screenshot protection as the normal results review. */
function GuardedReview(props: {
  examId: number;
  code: string;
  questions: QuestionWithAnswer[];
  rivalName: string;
  rivalAnswers: RivalAnswer[] | null;
  profile: UserProfile;
}) {
  const lockout = useReviewLockout(props.examId);
  const { guardState, dismissViolation } = useExamGuard({ mode: "review", enabled: !lockout.isLocked });

  if (lockout.isLocked) {
    return (
      <ReviewLockedPage
        examId={props.examId}
        isPermanent={lockout.isPermanentlyLocked}
        canRequestLastChance={lockout.canRequestLastChance()}
        cooldownMinutes={lockout.lastChanceCooldownRemaining()}
        onRequestLastChance={lockout.requestLastChance}
      />
    );
  }

  return (
    <>
      <div className="sb-print-watermark" />
      <ExamSecurityOverlay
        guardState={guardState}
        onDismiss={() => {
          dismissViolation();
          lockout.recordViolation();
        }}
        mode="review"
      />
      <DuelReview {...props} />
    </>
  );
}

function secondsText(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "–";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

/**
 * Review answers (mockup board 10; 12d for free students): one question at
 * a time, filters, both players' picks and times, the explanation, bookmark
 * and report, and an answer sheet with a Your / rival toggle. Free students
 * see their own answers and the explanations; the rival's picks are locked.
 */
function DuelReview({
  examId,
  code,
  questions,
  rivalName,
  rivalAnswers,
  profile,
}: {
  examId: number;
  code: string;
  questions: QuestionWithAnswer[];
  rivalName: string;
  rivalAnswers: RivalAnswer[] | null;
  profile: UserProfile;
}) {
  const { data: examProfile } = useExamProfile();
  const home = useDuelHome();
  const locked = rivalAnswers === null;
  const isPremium = home.data?.freeDuel.isPremium ?? profile.isPremium;
  const theirs = useMemo(() => new Map((rivalAnswers ?? []).map((answer) => [answer.questionId, answer])), [rivalAnswers]);
  const subjects = useMemo(() => new Map((examProfile?.subjects ?? []).map((subject) => [subject.name, subject])), [examProfile]);
  const createBookmark = useCreateBookmark();

  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [whose, setWhose] = useState<"me" | "rival">("me");
  const [reportOpen, setReportOpen] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const tests: Record<Filter, (q: QuestionWithAnswer) => boolean> = {
    all: () => true,
    wrong: (q) => Boolean(q.userAnswer) && !q.isCorrect,
    blank: (q) => !q.userAnswer,
    beat: (q) => !q.isCorrect && theirs.get(q.id)?.isCorrect === true,
    won: (q) => q.isCorrect && theirs.get(q.id)?.isCorrect !== true,
  };
  const filterList: Array<[Filter, string]> = [
    ["all", "All"],
    ["wrong", "Wrong"],
    ["blank", "Blank"],
    ...(locked
      ? []
      : ([
          ["beat", `${rivalName} beat you`],
          ["won", `You beat ${rivalName}`],
        ] as Array<[Filter, string]>)),
  ];
  const list = questions.filter(tests[filter]);
  const at = Math.min(index, Math.max(0, list.length - 1));
  const q = list[at];
  const number = q ? questions.indexOf(q) + 1 : 0;

  function pickFilter(next: Filter) {
    setFilter(next);
    setIndex(0);
  }

  function open(questionNumber: number) {
    setFilter("all");
    setIndex(questionNumber - 1);
    setSheetOpen(false);
  }

  async function bookmark() {
    if (!q || saved.has(q.id)) return;
    try {
      await createBookmark.mutateAsync({ questionId: q.id, examId });
      setSaved(new Set(saved).add(q.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not bookmark this question.");
    }
  }

  return (
    <div className={cn("sb-ui", s.page)}>
      <header className={s.top}>
        <Link className={s.iconBtn} href={`/exams/${examId}/results?duel=${code}` as Route} aria-label="Back to the result">
          <BackIcon />
        </Link>
        <h1 className={s.topTitle}>Review answers</h1>
        <button type="button" className={v.sheetBtn} onClick={() => setSheetOpen(true)}>
          <GridIcon />
          Answer sheet
        </button>
      </header>

      <div className={v.filters} role="group" aria-label="Show">
        {filterList.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(v.fchip, filter === id && v.fchipOn)}
            aria-pressed={filter === id}
            onClick={() => pickFilter(id)}
          >
            {label} <b>{questions.filter(tests[id]).length}</b>
          </button>
        ))}
      </div>

      <main className={v.read}>
        {!q ? (
          <div className={v.empty}><b>Nothing here</b>No questions match this filter.</div>
        ) : (
          <QuestionView
            key={q.id}
            q={q}
            number={number}
            pos={`${at + 1} of ${list.length}`}
            rivalName={rivalName}
            rival={locked ? null : theirs.get(q.id) ?? { questionId: q.id, userAnswer: null, isCorrect: false, timeSpentSeconds: 0 }}
            locked={locked}
            isPremium={isPremium}
            subject={subjects.get(q.subject)}
            saved={saved.has(q.id)}
            onBookmark={bookmark}
            onReport={() => setReportOpen(true)}
          />
        )}
      </main>

      <div className={cn(v.thumb, v.stickyBar)}>
        <button type="button" className={v.prev} disabled={at === 0} onClick={() => setIndex(at - 1)}>
          <BackIcon />
          Back
        </button>
        <button type="button" className={v.next} disabled={at >= list.length - 1} onClick={() => setIndex(at + 1)}>
          {at >= list.length - 1 ? "Last one" : "Next"}
          <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><BackIcon /></span>
        </button>
      </div>

      {sheetOpen && (
        <AnswerSheet
          questions={questions}
          theirs={theirs}
          locked={locked}
          rivalName={rivalName}
          whose={whose}
          current={number}
          onWhose={setWhose}
          onOpen={open}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {q && (
        <ReportQuestionModal
          questionId={q.id}
          questionNumber={number}
          subject={q.subject}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

function QuestionView({
  q,
  number,
  pos,
  rivalName,
  rival,
  locked,
  isPremium,
  subject,
  saved,
  onBookmark,
  onReport,
}: {
  q: QuestionWithAnswer;
  number: number;
  pos: string;
  rivalName: string;
  rival: RivalAnswer | null;
  locked: boolean;
  isPremium: boolean;
  subject: { iconName: string; code: string; colorToken: string } | undefined;
  saved: boolean;
  onBookmark: () => void;
  onReport: () => void;
}) {
  const youBlank = !q.userAnswer;
  const youRight = q.isCorrect;
  const theyRight = rival?.isCorrect === true;
  const theyBlank = !rival?.userAnswer;

  let verdict: string;
  if (locked) verdict = youBlank ? "You left this blank." : youRight ? "You got this right." : "You missed this one.";
  else if (youBlank) verdict = theyRight ? `You left this blank. ${rivalName} got it.` : "You left this blank.";
  else if (youRight && theyRight) verdict = "You both got this right.";
  else if (youRight) verdict = `You got this. ${rivalName} didn't.`;
  else if (theyRight) verdict = `You missed this. ${rivalName} got it.`;
  else verdict = "You both missed this one.";
  const tone = youRight ? v.good : youBlank ? v.blank : v.bad;

  const word = (blank: boolean, right: boolean) => (blank ? "Blank" : right ? "Right" : "Wrong");
  const wordClass = (blank: boolean, right: boolean) => (blank ? v.stB : right ? v.stR : v.stW);
  const key = q.correctAnswer.trim().toUpperCase();

  return (
    <div>
      <div className={v.qmeta}>
        <div className={v.qmetaLeft}>
          <SubjectTile iconName={subject?.iconName} code={subject?.code ?? q.subject.slice(0, 3).toUpperCase()} colorToken={subject?.colorToken} size={28} />
          <b>Question {number}</b>
          <span>{q.subject}</span>
        </div>
        <span className={v.pos}>{pos}</span>
      </div>

      <section className={cn(v.verdict, tone)} aria-label="How you both did">
        <p>{verdict}</p>
        <div className={v.who}>
          <span className={v.wchip}>
            <span className={v.ringY}><DuelAvatar self size={22} /></span>
            <b>You</b>
            <span className={cn(v.st, wordClass(youBlank, youRight))}>{word(youBlank, youRight)}</span>
          </span>
          <span className={v.wchip}>
            <span className={v.ringT}><DuelAvatar size={22} /></span>
            <b>{rivalName}</b>
            <span className={cn(v.st, locked ? v.stLk : wordClass(theyBlank, theyRight))}>{locked ? "Premium" : word(theyBlank, theyRight)}</span>
          </span>
        </div>
      </section>

      <div className="sb-protected">
        <SharedStimulus compact text={q.parentQuestionText} imageUrl={q.parentQuestionImageUrl} onImageClick={() => undefined} />
        <div className={v.qtext}><MathMarkdown content={q.questionText} variant="question" /></div>
        {q.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={cn(v.qimg, "sb-protected-img")} src={displayImageUrl(q.imageUrl)} alt="Question" draggable={false} onContextMenu={(event) => event.preventDefault()} />
        )}

        <div className={v.opts}>
          {LETTERS.map((letter) => {
            const text = q[`option${letter}` as keyof QuestionWithAnswer] as string | null;
            const image = q[`option${letter}ImageUrl` as keyof QuestionWithAnswer] as string | null;
            if (!text && !image) return null;
            const isKey = key === letter;
            const isYou = q.userAnswer?.toUpperCase() === letter;
            const isThem = !locked && rival?.userAnswer?.toUpperCase() === letter;
            return (
              <div key={letter} className={cn(v.opt, isKey && v.key, isYou && !isKey && v.miss)}>
                <span className={v.oval} aria-hidden="true">{letter}</span>
                <span className={v.ot}>
                  {text ? <MathMarkdown content={text} /> : null}
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayImageUrl(image)} alt={`Option ${letter}`} className="sb-protected-img" draggable={false} />
                  ) : null}
                </span>
                {(isKey || isYou || isThem) && (
                  <span className={v.tags}>
                    {isKey && <span className={cn(v.tag, v.correct, v.plain)}><CheckIcon />Correct answer</span>}
                    {isYou && (
                      <span className={cn(v.tag, !isKey && v.wrongTag)}>
                        <span className={v.ringY}><DuelAvatar self size={18} /></span>Your answer
                      </span>
                    )}
                    {isThem && (
                      <span className={v.tag}>
                        <span className={v.ringT}><DuelAvatar size={18} /></span>{rivalName}&apos;s answer
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {locked && (
        <div className={v.lockbar}>
          <LockIcon />
          <span><b>What did {rivalName} pick?</b>Premium shows {rivalName}&apos;s answer and time on every question.</span>
          {!isPremium && (
            <Link className={v.lockbtn} href={"/dashboard/settings?tab=subscription" as Route}>Unlock</Link>
          )}
        </div>
      )}

      {q.explanation && (
        <section className={cn(v.why, "sb-protected")}>
          <h3>Why {key} is right</h3>
          <div className={v.whyBody}><MathMarkdown content={q.explanation.text} variant="explanation" /></div>
          {q.explanation.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={cn(v.qimg, "sb-protected-img")} style={{ marginTop: 12 }} src={displayImageUrl(q.explanation.imageUrl)} alt="Explanation" draggable={false} />
          )}
          {q.explanation.additionalNotes && (
            <div className={v.notes}><MathMarkdown content={q.explanation.additionalNotes} /></div>
          )}
          <div className={v.times}>
            <span>You took <b>{secondsText(q.timeSpentSeconds)}</b></span>
            {!locked && <span>{rivalName} took <b>{secondsText(rival?.timeSpentSeconds)}</b></span>}
          </div>
        </section>
      )}

      <div className={v.acts}>
        <button type="button" className={cn(v.act, saved && v.actOn)} aria-pressed={saved} onClick={onBookmark}>
          <BookmarkIcon />
          {saved ? "Bookmarked" : "Bookmark"}
        </button>
        <button type="button" className={v.act} onClick={onReport}>
          <FlagIcon />
          Report a problem
        </button>
      </div>
    </div>
  );
}

function AnswerSheet({
  questions,
  theirs,
  locked,
  rivalName,
  whose,
  current,
  onWhose,
  onOpen,
  onClose,
}: {
  questions: QuestionWithAnswer[];
  theirs: Map<number, RivalAnswer>;
  locked: boolean;
  rivalName: string;
  whose: "me" | "rival";
  current: number;
  onWhose: (next: "me" | "rival") => void;
  onOpen: (questionNumber: number) => void;
  onClose: () => void;
}) {
  const showRival = whose === "rival" && !locked;
  const rows: Array<{ name: string; cells: Array<{ n: number; state: "r" | "w" | "b" }> }> = [];
  questions.forEach((q, i) => {
    let row = rows.find((r) => r.name === q.subject);
    if (!row) {
      row = { name: q.subject, cells: [] };
      rows.push(row);
    }
    const answer = showRival ? theirs.get(q.id) : null;
    const picked = showRival ? answer?.userAnswer : q.userAnswer;
    const right = showRival ? answer?.isCorrect === true : q.isCorrect;
    row.cells.push({ n: i + 1, state: !picked ? "b" : right ? "r" : "w" });
  });
  const total = rows.reduce((sum, row) => sum + row.cells.filter((cell) => cell.state === "r").length, 0);

  return (
    <div className={v.scrim} onClick={onClose}>
      <div className={cn("sb-ui", v.sheet)} role="dialog" aria-label="Answer sheet" onClick={(event) => event.stopPropagation()}>
        <div className={v.grab} aria-hidden="true" />
        <div className={v.sheetHead}>
          <h2>Answer sheet</h2>
          <span>{total} of {questions.length}</span>
        </div>
        {!locked && (
          <div className={v.seg2} role="group" aria-label="Whose sheet">
            <button type="button" className={cn(whose === "me" && v.seg2On)} aria-pressed={whose === "me"} onClick={() => onWhose("me")}>Your sheet</button>
            <button type="button" className={cn(whose === "rival" && v.seg2On)} aria-pressed={whose === "rival"} onClick={() => onWhose("rival")}>{rivalName}&apos;s sheet</button>
          </div>
        )}
        {rows.map((row) => (
          <div key={row.name} className={v.subjrow}>
            <span className={v.sn}>{row.name}</span>
            <div className={v.grid}>
              {row.cells.map((cell) => (
                <button
                  key={cell.n}
                  type="button"
                  className={cn(v.cell, cell.state === "r" ? v.cellR : cell.state === "w" ? v.cellW : v.cellB, cell.n === current && v.cellNow)}
                  aria-label={`Question ${cell.n}, ${cell.state === "r" ? "right" : cell.state === "w" ? "wrong" : "blank"}`}
                  onClick={() => onOpen(cell.n)}
                />
              ))}
            </div>
            <span className={v.sc}>{row.cells.filter((cell) => cell.state === "r").length}</span>
          </div>
        ))}
        <div className={v.legend}>
          <span><i style={{ background: "var(--ui-good)" }} />Right</span>
          <span><i style={{ background: "var(--ui-bad)" }} />Wrong</span>
          <span><i style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.3)" }} />Blank</span>
          <span><i style={{ boxShadow: "0 0 0 1.5px var(--ui-ink)" }} />Open now</span>
        </div>
      </div>
    </div>
  );
}

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
