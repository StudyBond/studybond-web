"use client";

/* Practice (rebuilt for the JAMB launch, 2026-11-24).

   One screen instead of the old three steps: pick what you are sitting,
   shade your subjects on a sheet like an answer sheet, and the slip at the
   bottom shows the paper you are about to sit. The rules come up in a short
   "Before you start" sheet just before the clock starts.

   Board-aware: every line reads from the student's board (exam profile), and
   Practice / Mixed only show on boards that have team-written practice
   questions. JAMB is real past questions only. */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { SubjectIcon, subjectPalette } from "@/components/ui/subject-icon";
import { getDashboardHome, homeKeys } from "@/features/home/api";
import { boardLabel, priceLine } from "@/features/home/format";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { useStartDailyChallengeMutation, useStartExamMutation } from "@/features/practice/hooks/use-practice-mutations";
import { getExamEligibility, getExamQuestions, type ExamType } from "@/lib/api/exams";
import type { ExamProfileSubject } from "@/lib/api/institutions";
import type { UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "./practice.module.css";

type Mode = "REAL_PAST_QUESTION" | "DAILY_CHALLENGE" | "STUDY" | "PRACTICE" | "MIXED";

const PLAN = "/dashboard/settings?tab=subscription" as Route;

/* Boards whose bank has team-written PRACTICE questions. JAMB has none: we
   only type real past questions for it, so Practice and Mixed would start
   and then fail for lack of questions. Add a board here once it has some. */
const BOARDS_WITH_PRACTICE_SETS = new Set(["UI"]);

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const LockIcon = () => (
  <svg {...svg} strokeWidth={2.2}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);
const ArrowIcon = () => (
  <svg {...svg} strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const TickIcon = () => (
  <svg {...svg} strokeWidth={2.6}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const SpinIcon = () => (
  <svg {...svg} strokeWidth={2.4} className={s.spin}><path d="M21 12a9 9 0 1 1-6.2-8.55" /></svg>
);

/* The shell's page fade-in uses a transform, which turns position: fixed
   into "fixed to the page". Anything that must sit on the screen (the phone
   slip, the sheets) is drawn on document.body instead. */
const noSubscribe = () => () => {};

function OnScreen({ children }: { children: ReactNode }) {
  const onClient = useSyncExternalStore(noSubscribe, () => true, () => false);
  return onClient ? createPortal(children, document.body) : null;
}

function duration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hours = `${h} hour${h === 1 ? "" : "s"}`;
  return m ? `${hours} ${m} min` : hours;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function isMode(value: string | null): value is Mode {
  return value === "REAL_PAST_QUESTION" || value === "DAILY_CHALLENGE" || value === "STUDY" || value === "PRACTICE" || value === "MIXED";
}

export function PracticePage({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const startExam = useStartExamMutation();
  const startChallenge = useStartDailyChallengeMutation();

  const examProfileQuery = useExamProfile();
  const ep = examProfileQuery.data;
  /* Home's own payload: premium for THIS board, the price, today's
     challenge and recent papers. Same cache entry Home uses. */
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 60_000, retry: 1 });
  const eligibility = useQuery({ queryKey: ["exam-eligibility"], queryFn: getExamEligibility });

  const isPremium = home.data?.plan.isPremium ?? profile.isPremium;
  const boardCode = ep?.institution.code ?? home.data?.board.code ?? "";
  const track = ep?.trackName ?? home.data?.board.examName ?? "exam";
  const board = boardCode ? boardLabel({ code: boardCode, examName: track }) : track;
  const subjects = useMemo(() => ep?.subjects ?? [], [ep]);
  const maxSubjects = ep?.maxSubjects ?? home.data?.board.maxSubjects ?? 4;
  const compulsory = subjects.filter((x) => x.isCompulsory).map((x) => x.name);
  const mixedCap = ep?.allowMixedFullExams ? maxSubjects : Math.max(1, maxSubjects - 1);
  const hasPracticeSets = BOARDS_WITH_PRACTICE_SETS.has(boardCode);
  const challenge = home.data?.challenge;
  const challengeDone = challenge?.state === "DONE";
  const challengeClosed = challenge?.state === "CLOSED";

  const modes = useMemo(() => {
    const list: Mode[] = ["REAL_PAST_QUESTION", "DAILY_CHALLENGE"];
    if (ep?.studyModeEnabled) list.push("STUDY");
    if (hasPracticeSets) list.push("PRACTICE", "MIXED");
    return list;
  }, [ep?.studyModeEnabled, hasPracticeSets]);

  const asked = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(isMode(asked) ? asked : "REAL_PAST_QUESTION");
  const [picked, setPicked] = useState<string[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [premiumFor, setPremiumFor] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  /* A link can ask for a mode this board does not offer (an old Practice
     link on JAMB). Fall back to past questions rather than an empty mode. */
  useEffect(() => {
    if (ep && !modes.includes(mode)) setMode("REAL_PAST_QUESTION");
  }, [ep, modes, mode]);

  const names = useMemo(() => new Set(subjects.map((x) => x.name)), [subjects]);
  const lastSet = useMemo(() => {
    const fromPaper = home.data?.recentPapers.find((p) => p.subjects.length === maxSubjects)?.subjects;
    const fromChallenge = challenge?.subjects.map((x) => x.name);
    const pick = [fromPaper, fromChallenge].find((set) => set && set.length === maxSubjects && set.every((n) => names.has(n)));
    return pick ?? null;
  }, [home.data, challenge, maxSubjects, names]);
  const defaultFull = useMemo(() => {
    const rest = subjects.filter((x) => !x.isCompulsory).map((x) => x.name);
    return [...compulsory, ...rest].slice(0, maxSubjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, maxSubjects]);

  /* The challenge is always a full set: fill it from the last full paper. */
  useEffect(() => {
    if (mode === "DAILY_CHALLENGE" && subjects.length > 0 && picked.length !== maxSubjects) {
      setPicked(lastSet ?? defaultFull);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subjects.length, lastSet]);

  const usedFree = (eligibility.data?.freeSubjectsTaken ?? []).map((x) => x.toLowerCase());
  const creditsLeft = eligibility.data?.creditsRemaining;
  const cap = mode === "MIXED" ? mixedCap : maxSubjects;

  /** Why a subject can't be shaded right now, if it can't. */
  function lockOf(subject: ExamProfileSubject): "USED" | "PREMIUM" | null {
    if (mode !== "REAL_PAST_QUESTION" || isPremium) return null;
    if (picked.includes(subject.name)) return null;
    if (usedFree.includes(subject.name.toLowerCase())) return "USED";
    if (subject.freeQuestionCount <= 0) return "PREMIUM";
    if (creditsLeft !== undefined && creditsLeft <= 0) return "PREMIUM";
    return null;
  }

  function questionsFor(subject: ExamProfileSubject) {
    return mode === "REAL_PAST_QUESTION" && !isPremium ? subject.freeQuestionCount : subject.questionCount;
  }

  function chooseMode(next: Mode) {
    setProblem(null);
    if ((next === "PRACTICE" || next === "MIXED") && !isPremium) {
      setPremiumFor(next === "PRACTICE" ? "Practice sets" : "Mixed papers");
      return;
    }
    setMode(next);
    const nextCap = next === "MIXED" ? mixedCap : maxSubjects;
    if (next !== "DAILY_CHALLENGE") setPicked((now) => now.slice(0, nextCap));
    const url = new URL(window.location.href);
    url.searchParams.set("mode", next);
    url.searchParams.delete("step");
    window.history.replaceState(null, "", url.toString());
  }

  function toggle(subject: ExamProfileSubject) {
    setProblem(null);
    const lock = lockOf(subject);
    if (lock) {
      setPremiumFor(subject.name);
      return;
    }
    const name = subject.name;
    if (picked.includes(name)) {
      setPicked((now) => now.filter((n) => n !== name));
      return;
    }
    if (picked.length >= cap) {
      setProblem(
        mode === "MIXED"
          ? `A mixed paper takes up to ${plural(cap, "subject")}. Unshade one first.`
          : `A paper takes up to ${plural(cap, "subject")}. Unshade one first.`,
      );
      return;
    }
    const missing = compulsory.filter((n) => !picked.includes(n));
    if (picked.length === maxSubjects - 1 && missing.length > 0 && !compulsory.includes(name)) {
      setProblem(`A full ${track} paper must include ${missing.join(" and ")}.`);
      return;
    }
    if (mode === "REAL_PAST_QUESTION" && creditsLeft !== undefined && picked.length >= creditsLeft) {
      setProblem(
        isPremium
          ? `You have ${plural(creditsLeft, "subject credit")} left today. They come back at midnight.`
          : `You have ${plural(creditsLeft, "free subject")} left.`,
      );
      return;
    }
    setPicked((now) => [...now, name]);
  }

  /* What the slip shows */
  const chosen = subjects.filter((x) => picked.includes(x.name)).sort((a, b) => picked.indexOf(a.name) - picked.indexOf(b.name));
  const isFull = chosen.length === maxSubjects;
  const totalQuestions = chosen.reduce((n, x) => n + questionsFor(x), 0);
  const totalSeconds = isFull && ep ? ep.fullExamDurationSeconds : chosen.reduce((n, x) => n + x.soloDurationSeconds, 0);

  let slipLine: React.ReactNode = "Shade the subjects you want to sit";
  if (chosen.length > 0) {
    if (mode === "DAILY_CHALLENGE") {
      slipLine = <><span className={s.num}>{chosen.length}</span> questions · <span className={s.num}>3</span> minutes</>;
    } else if (mode === "STUDY") {
      slipLine = <>{plural(chosen.length, "subject")} · no clock</>;
    } else {
      slipLine = (
        <>
          {plural(chosen.length, "subject")} · <span className={s.num}>{totalQuestions}</span> questions · <span className={s.num}>{duration(totalSeconds)}</span>
        </>
      );
    }
  }

  const ready =
    chosen.length > 0 &&
    !(mode === "DAILY_CHALLENGE" && (chosen.length !== maxSubjects || challengeDone || challengeClosed));
  const buttonText =
    mode === "DAILY_CHALLENGE" ? (challengeDone ? "Done today" : "Start challenge") : mode === "STUDY" ? "Open study" : "Start paper";

  function onStart() {
    if (!ready) {
      if (mode === "DAILY_CHALLENGE" && chosen.length !== maxSubjects) {
        setProblem(`The challenge takes one question from each of ${maxSubjects} subjects. Shade ${maxSubjects}.`);
      }
      return;
    }
    if (mode === "STUDY") {
      router.push(`/dashboard/study?subjects=${encodeURIComponent(picked.join(","))}` as Route);
      return;
    }
    setStartError(null);
    setConfirming(true);
  }

  async function enter() {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    try {
      const res =
        mode === "DAILY_CHALLENGE"
          ? await startChallenge.mutateAsync({ subjects: picked })
          : await startExam.mutateAsync({ examType: mode as ExamType, subjects: picked });
      queryClient.prefetchQuery({ queryKey: ["exam-session", res.examId], queryFn: () => getExamQuestions(res.examId) }).catch(() => {});
      router.push(`/exams/${res.examId}`);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "We could not start the paper. Try again.");
      setStarting(false);
    }
  }

  /* The line under the modes: what this mode is, and the plan's limits. */
  let note: React.ReactNode = null;
  if (mode === "REAL_PAST_QUESTION") {
    if (isPremium) {
      note = creditsLeft !== undefined
        ? <>Each subject you sit uses one credit. You have <b>{plural(creditsLeft, "credit")}</b> left today.</>
        : <>Real {track} questions from past years, timed like the exam.</>;
    } else {
      note = (
        <>
          On the free plan you can sit each subject once
          {creditsLeft !== undefined ? <>, and you have <b>{creditsLeft} left</b></> : null}.{" "}
          <button type="button" className={s.linkBtn} onClick={() => setPremiumFor("all subjects")}>What premium adds</button>
        </>
      );
    }
  } else if (mode === "DAILY_CHALLENGE") {
    if (challengeDone) {
      note = (
        <>
          Done today{challenge?.right != null && challenge.total != null ? <>: <b>{challenge.right} of {challenge.total} right</b></> : null}
          {challenge?.spEarned != null ? <>, +{challenge.spEarned} SP</> : null}. A new one opens at midnight.
        </>
      );
    } else if (challengeClosed) {
      note = <>Today&apos;s challenge has closed. A new one opens at midnight.</>;
    } else {
      note = <>Free for everyone. One question from each subject in 3 minutes, up to <b>40 SP</b>, and it ticks today on your streak.</>;
    }
  } else if (mode === "STUDY") {
    note = <>One question at a time with no clock. You see the answer and the explanation as soon as you choose.</>;
  } else if (mode === "PRACTICE") {
    note = <>Questions our team wrote to drill each topic. They are <b>not</b> past questions.</>;
  } else if (mode === "MIXED") {
    note = <>Half past questions, half practice questions, up to {plural(mixedCap, "subject")}.</>;
  }

  const modeCopy: Record<Mode, { title: string; sub: string }> = {
    REAL_PAST_QUESTION: { title: "Past questions", sub: `Real ${track} questions, timed like the exam` },
    DAILY_CHALLENGE: { title: "Today's challenge", sub: `${maxSubjects} questions · 3 minutes` },
    STUDY: { title: "Study mode", sub: "No clock. Answer, then see why" },
    PRACTICE: { title: "Practice set", sub: "Team-written drills by topic" },
    MIXED: { title: "Mixed", sub: "Past and practice questions together" },
  };

  const fullLine = ep
    ? `A full paper is ${plural(maxSubjects, "subject")}, ${ep.fullExamQuestions} questions, ${duration(ep.fullExamDurationSeconds)}.`
    : "";

  const slip = (where: string) => (
    <div className={cn(s.slip, where)}>
      <div className={s.slipT}>
        <b>{chosen.length > 0 ? chosen.map((x) => x.name).join(", ") : modeCopy[mode].title}</b>
        <small>{slipLine}</small>
      </div>
      <button type="button" className={s.btn} disabled={!ready} onClick={onStart}>
        {buttonText}
        {ready ? <ArrowIcon /> : null}
      </button>
    </div>
  );

  return (
    <div className={cn("sb-ui", s.root)}>
      <header className={s.head}>
        <h1 className={s.title}>Practice</h1>
        <p className={s.lead}>
          <b>{board}</b>{fullLine ? <> · {fullLine}</> : null}
        </p>
      </header>

      <div className={s.cols}>
        <section aria-labelledby="pr-modes">
          <div className={s.h}><h2 id="pr-modes">What you&apos;re sitting</h2></div>
          <div className={s.modes} role="radiogroup" aria-labelledby="pr-modes">
            {modes.map((m, i) => {
              const on = m === mode;
              const locked = (m === "PRACTICE" || m === "MIXED") && !isPremium;
              const wide = i === 0 && modes.length % 2 === 1;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={cn(s.mode, on && s.modeOn, wide && s.modeWide)}
                  onClick={() => chooseMode(m)}
                >
                  <b>{modeCopy[m].title}</b>
                  <small>{modeCopy[m].sub}</small>
                  {locked ? <span className={cn(s.tag, s.tagPrem)}>Premium</span> : null}
                  {m === "DAILY_CHALLENGE" && challengeDone ? <span className={cn(s.tag, s.tagOk)}>Done</span> : null}
                  {m === "DAILY_CHALLENGE" && !challengeDone && challenge?.state === "OPEN" ? <span className={cn(s.tag, s.tagDim)}>Free</span> : null}
                </button>
              );
            })}
          </div>
          {note ? <p className={s.note} key={mode}><i />{<span>{note}</span>}</p> : null}
        </section>

        <section aria-labelledby="pr-subjects">
          <div className={s.h}>
            <h2 id="pr-subjects">Your subjects</h2>
            <span className={s.num}>{picked.length} of {cap} shaded</span>
          </div>

          {examProfileQuery.isLoading ? (
            <div className={s.sheet}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={s.subj} style={{ cursor: "default" }}>
                  <span className={s.sk} style={{ width: 30, height: 30, borderRadius: "50%" }} />
                  <span className={s.sk} style={{ width: 30, height: 30, borderRadius: 8 }} />
                  <span className={s.sk} style={{ height: 14, width: `${50 + i * 7}%` }} />
                  <span />
                </div>
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <p className={s.err}><i /><span>We couldn&apos;t load your subjects. Check your connection, then refresh the page.</span></p>
          ) : (
            <div className={s.sheet}>
              {subjects.map((subject) => {
                const order = picked.indexOf(subject.name);
                const on = order >= 0;
                const lock = lockOf(subject);
                const atCap = !on && !lock && picked.length >= cap;
                const fixedSet = mode === "DAILY_CHALLENGE" && (challengeDone || challengeClosed);
                const q = questionsFor(subject);
                const sub =
                  mode === "DAILY_CHALLENGE" ? "1 question"
                  : mode === "STUDY" ? "Topic by topic"
                  : `${q} questions · ${duration(subject.soloDurationSeconds)}`;
                return (
                  <button
                    key={subject.name}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    disabled={fixedSet}
                    className={cn(s.subj, on && s.subjOn, (atCap || fixedSet) && s.subjOff, lock && s.subjLock)}
                    onClick={() => toggle(subject)}
                  >
                    <span className={s.bub}>{lock ? <LockIcon /> : on ? order + 1 : ""}</span>
                    <span className={s.ic}>
                      <SubjectIcon iconName={subject.iconName} code={subject.code} size={18} className={subjectPalette(subject.colorToken).text} />
                    </span>
                    <span className={s.nm}>
                      <b>{subject.name}</b>
                      <small>{lock === "USED" ? "You've sat your free paper" : sub}</small>
                    </span>
                    {lock === "USED" ? <span className={s.used}>Used</span>
                      : lock === "PREMIUM" ? <span className={s.prem}>Premium</span>
                      : subject.isCompulsory && mode !== "STUDY" ? <span className={s.must}>Compulsory</span>
                      : <span />}
                  </button>
                );
              })}
              {mode !== "DAILY_CHALLENGE" ? (
                <div className={s.sheetFoot}>
                  <span>Tap a subject to shade it. Tap again to clear.</span>
                  <span style={{ display: "flex", gap: 14 }}>
                    {lastSet && lastSet.join() !== picked.join() && cap >= maxSubjects && (isPremium || mode !== "REAL_PAST_QUESTION") ? (
                      <button type="button" className={s.linkBtn} onClick={() => { setProblem(null); setPicked(lastSet); }}>Use my last {maxSubjects}</button>
                    ) : null}
                    {picked.length > 0 ? (
                      <button type="button" className={s.linkBtn} onClick={() => { setProblem(null); setPicked([]); }}>Clear</button>
                    ) : null}
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {problem ? <p className={s.err} role="alert"><i /><span>{problem}</span></p> : null}

          {slip(s.slipInline)}
        </section>
      </div>

      <OnScreen>
      <div className={cn("sb-ui", s.layer)}>
      {slip(s.slipDock)}

      {confirming ? (
        <div className={s.scrim} onClick={() => !starting && setConfirming(false)}>
          <div className={s.pop} role="dialog" aria-modal="true" aria-labelledby="pr-before" onClick={(e) => e.stopPropagation()}>
            <div className={s.popBody}>
            <h2 id="pr-before">Before you start</h2>
            <p>{mode === "DAILY_CHALLENGE" ? "Today's challenge" : `${board} ${modeCopy[mode].title.toLowerCase()}`}. The clock starts as soon as you tap Start.</p>
            <div className={s.paper}>
              <span><b>{chosen.length}</b><small>{chosen.length === 1 ? "subject" : "subjects"}</small></span>
              <span><b>{mode === "DAILY_CHALLENGE" ? chosen.length : totalQuestions}</b><small>questions</small></span>
              <span><b>{mode === "DAILY_CHALLENGE" ? "3 min" : duration(totalSeconds)}</b><small>on the clock</small></span>
            </div>
            <div className={s.paperSubs}>
              {chosen.map((x) => (
                <span key={x.name}>
                  <SubjectIcon iconName={x.iconName} code={x.code} size={14} className={subjectPalette(x.colorToken).text} />
                  {x.name}
                </span>
              ))}
            </div>
            <ol className={s.rules}>
              <li><span>1</span><span><b>Stay on this tab.</b> If you leave, a countdown starts, and the paper submits itself when it runs out.</span></li>
              <li><span>2</span><span><b>No screenshots or screen recording.</b> Copy, paste and right-click are off during the paper.</span></li>
              <li><span>3</span><span>On a keyboard, press <kbd>A</kbd> to <kbd>E</kbd> to choose, and the arrow keys or <kbd>P</kbd> / <kbd>N</kbd> to move.</span></li>
            </ol>
            {startError ? <p className={s.popErr} role="alert">{startError}</p> : null}
            </div>
            <div className={s.popActs}>
              <button type="button" className={s.ghost} disabled={starting} onClick={() => setConfirming(false)}>Back</button>
              <button type="button" className={s.btn} disabled={starting} onClick={enter}>
                {starting ? <><SpinIcon /> Starting…</> : <>Start {mode === "DAILY_CHALLENGE" ? "challenge" : "paper"} <ArrowIcon /></>}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {premiumFor ? (
        <div className={s.scrim} onClick={() => setPremiumFor(null)}>
          <div className={s.pop} role="dialog" aria-modal="true" aria-labelledby="pr-prem" onClick={(e) => e.stopPropagation()}>
            <div className={s.popBody}>
            <h2 id="pr-prem">Premium for {board}</h2>
            <p>
              {premiumFor === "Practice sets" || premiumFor === "Mixed papers"
                ? `${premiumFor} come with premium.`
                : premiumFor === "all subjects"
                  ? "The free plan gives you one paper in each subject."
                  : `You've used your free ${premiumFor} paper, or it isn't in the free set.`}
            </p>
            <ul className={s.perks}>
              <li><TickIcon /><span>Every past question we have in every subject, not only the free set</span></li>
              {subjects.some((x) => x.questionCount > x.freeQuestionCount) ? (
                <li><TickIcon /><span>Full-length papers, like the real {track}</span></li>
              ) : null}
              {hasPracticeSets ? <li><TickIcon /><span>Practice sets and mixed papers</span></li> : null}
            </ul>
            {home.data ? <p className={s.price}>{priceLine(home.data.plan.priceNaira, home.data.plan.durationMonths)}</p> : null}
            </div>
            <div className={s.popActs}>
              <button type="button" className={s.ghost} onClick={() => setPremiumFor(null)}>Not now</button>
              <Link href={PLAN} className={s.btn}>See premium</Link>
            </div>
          </div>
        </div>
      ) : null}
      </div>
      </OnScreen>
    </div>
  );
}
