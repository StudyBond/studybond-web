"use client";

import type { Route } from "next";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Flag, Rows2, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { ErrorState } from "@/components/ui/error-state";
import { ExamLoading } from "@/features/exam/components/exam-loading";
import { ExamReading } from "@/features/exam/components/exam-reading";
import { PaperRail } from "@/features/exam/components/paper-rail";
import { QuestionRibbon, RibbonCells } from "@/features/exam/components/question-ribbon";
import { RivalPill } from "@/features/exam/components/rival-pill";
import { ExamMenu } from "@/features/exam/components/exam-menu";
import { useExamTick } from "@/features/exam/hooks/use-exam-tick";
import { useExamPrefs, useSyncExamPrefs } from "@/features/exam/stores/exam-prefs-store";
import {
  FLAT_COLOUR,
  answeredInPaper,
  paperColours,
  paperLabel,
  paperOfIndex,
  softColour,
} from "@/features/exam/lib/papers";
import { textScale } from "@/features/exam/lib/text-size";
import { useOfflineStatus } from "@/providers/offline-sync-provider";
import { firstName } from "@/features/duel/ui/parts";
import s from "@/features/exam/components/exam-shell.module.css";
import tk from "@/features/exam/components/exam-tokens.module.css";
import { SubmitDialog } from "@/features/exam/components/submit-dialog";
import { AbandonDialog } from "@/features/exam/components/abandon-dialog";
import { TimeExpiredModal } from "@/features/exam/components/time-expired-modal";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { ExamCalculator } from "@/features/exam/components/exam-calculator";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import { useExamSession } from "@/features/exam/hooks/use-exam-session";
import {
  useSubmitExamMutation,
  useAbandonExamMutation,
} from "@/features/exam/hooks/use-exam-mutations";
import { useExamStore } from "@/features/exam/stores/exam-store";
import type { ExamQuestion } from "@/lib/api/types";
import { getUserProfile } from "@/lib/api/users";
import { offlineStore } from "@/features/exam/stores/offline-store";
import { useDuelSession } from "@/features/duel/hooks/use-duel";
import { useDuelWebsocket } from "@/features/duel/hooks/use-duel-websocket";
import { reactionLabel, type IncomingReaction } from "@/features/duel/race/duel-race";
import { useGhostPosition } from "@/features/duel/race/ghost-lane";


type ExamArenaProps = {
  examId: number;
};

export function ExamArena({ examId }: ExamArenaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ribbonOpen, setRibbonOpen] = useState(false);
  const { isOnline } = useOfflineStatus();
  useExamTick();

  // Settings hold the defaults. Auto-advance can be flipped for this sitting
  // only from the ... menu; null means "follow the setting".
  useSyncExamPrefs();
  const paperColourOn = useExamPrefs((p) => p.paperColour);
  const autoAdvanceDefault = useExamPrefs((p) => p.autoAdvance);
  const textSize = useExamPrefs((p) => p.textSize);
  const [autoAdvanceOverride, setAutoAdvanceOverride] = useState<boolean | null>(null);
  const autoAdvance = autoAdvanceOverride ?? autoAdvanceDefault;

  // ─── Current user identity ───
  // The profile query is already warm from the dashboard shell. We read
  // from the cache to avoid an extra network round-trip.
  const { data: profile } = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getUserProfile,
  });
  const myUserId = profile?.id ?? null;

  // "collab" is the old name; links saved before the duel rename still use it.
  const duelCode = searchParams.get("duel") ?? searchParams.get("collab");
  // A ghost race (?ghost=1): the ghost's lane, and its result page after submit.
  const isGhostRace = searchParams.get("ghost") === "1";
  const { data: duelData, refetch: refetchDuelSession } = useDuelSession(duelCode || "", !!duelCode);
  const duelSession = duelData?.session;

  const { data: session, isLoading, isError, error } = useExamSession(examId);

  const initSession = useExamStore((s) => s.initSession);
  const storeExamId = useExamStore((s) => s.examId);
  const totalQuestions = useExamStore((s) => s.totalQuestions);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const subjectRanges = useExamStore((s) => s.subjectRanges);
  const goToQuestion = useExamStore((s) => s.goToQuestion);
  const toggleFlag = useExamStore((s) => s.toggleFlag);
  const nextQuestion = useExamStore((s) => s.nextQuestion);
  const prevQuestion = useExamStore((s) => s.prevQuestion);
  const markEntered = useExamStore((s) => s.markEntered);
  const setAnswer = useExamStore((s) => s.setAnswer);
  const questionStates = useExamStore((s) => s.questionStates);
  const recordTimeSpent = useExamStore((s) => s.recordTimeSpent);
  const buildSubmitPayload = useExamStore((s) => s.buildSubmitPayload);
  const reset = useExamStore((s) => s.reset);
  const restoreFromIDB = useExamStore((s) => s.restoreFromIDB);
  const setSubmitDialogOpen = useExamStore((s) => s.setSubmitDialogOpen);
  const setAbandonDialogOpen = useExamStore((s) => s.setAbandonDialogOpen);
  const setTimeExpiredModalOpen = useExamStore((s) => s.setTimeExpiredModalOpen);
  const submitDialogOpen = useExamStore((s) => s.submitDialogOpen);
  const timeExpiredModalOpen = useExamStore((s) => s.timeExpiredModalOpen);
  const abandonDialogOpen = useExamStore((s) => s.abandonDialogOpen);

  const submitMutation = useSubmitExamMutation();
  const abandonMutation = useAbandonExamMutation();

  const prevIndexRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- DUEL STATE ---
  const [opponentProgress, setOpponentProgress] = useState<{ current: number; total: number } | null>(null);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [incomingReaction, setIncomingReaction] = useState<IncomingReaction | null>(null);
  const opponentFinishedToastShownRef = useRef(false);

  // Identify the opponent by excluding ourselves. This is the correct
  // approach: compare against the authenticated user's numeric ID, NOT
  // the exam's displayNameLong (which is a generated title like
  // "1v1 Duel #3: Physics, Mathematics", not a person's name).
  const opponent = duelSession?.participants.find(
    (p) => typeof myUserId === "number" && p.userId !== myUserId,
  ) ?? null;

  const markOpponentFinished = useCallback(() => {
    setOpponentFinished(true);
  }, []);

  const opponentFirstName = opponent ? firstName(opponent.fullName) : "Your rival";

  const { sendProgress, sendReaction } = useDuelWebsocket({
    sessionId: duelSession?.id ?? null,
    myUserId,
    // The hook already filters out self-echo for client-originated events
    // (progress, emoji) using fromUserId. However, the `finished` event
    // is SERVER-originated — it goes through markParticipantFinished, not
    // emitClientRealtimeEvent — so `fromUserId` is never injected. We
    // must filter self-events manually via the userId in the payload.
    onProgressUpdate: (_fromUserId, current, total) => {
      setOpponentProgress({ current, total });
    },
    // The six reactions (duel phase two); older pages still send emoji.
    onReaction: (_fromUserId, key) => {
      setIncomingReaction({ id: crypto.randomUUID(), label: reactionLabel(key) });
    },
    onEmojiReaction: (_fromUserId, emoji) => {
      setIncomingReaction({ id: crypto.randomUUID(), label: emoji });
    },
    onFinished: (finishedUserId) => {
      // The server's `finished` event carries `userId` (not `fromUserId`),
      // so the hook's built-in self-echo filter does NOT catch it. We must
      // explicitly ignore our own completion event here.
      if (typeof myUserId === "number" && finishedUserId === myUserId) return;
      markOpponentFinished();
      if (opponentFinishedToastShownRef.current) return;
      opponentFinishedToastShownRef.current = true;
      toast(`${opponentFirstName} has submitted.`, {
        description: "Take your time. Marks win a duel, not speed.",
        duration: 5000,
      });
    },
    onSessionCompleted: () => {
      // The server's authoritative "all participants finished" signal.
      // Force-navigate to results regardless of local state — this is the
      // definitive end-of-duel event and resolves any race conditions
      // between the two players' `finished` events.
      if (duelCode) {
        router.push(`/exams/${examId}/results?duel=${duelCode}`);
      } else {
        router.push(`/exams/${examId}/results`);
      }
    },
  });

  useEffect(() => {
    if (!opponentFinished || opponentFinishedToastShownRef.current) {
      return;
    }

    opponentFinishedToastShownRef.current = true;
    toast(`${opponentFirstName} has submitted.`, {
      description: "Take your time. Marks win a duel, not speed.",
      duration: 5000,
    });
  }, [opponentFinished, opponentFirstName]);

  useEffect(() => {
    const opponentState = opponent?.participantState;
    if (opponentState === "FINISHED" || duelSession?.status === "COMPLETED") {
      // Defer state update to avoid synchronous setState inside effect which
      // can cause cascading renders. Schedule on next macrotask.
      const t = setTimeout(() => markOpponentFinished(), 0);
      return () => clearTimeout(t);
    }
  }, [duelSession?.status, markOpponentFinished, opponent?.participantState]);

  // Send progress whenever we change questions
  useEffect(() => {
    if (duelSession && session) {
      sendProgress(currentIndex + 1, session.questions.length);
    }
  }, [currentIndex, duelSession, session, sendProgress]);
  // ------------------

  const needsSessionInit =
    !!session &&
    (storeExamId !== examId ||
      totalQuestions !== session.questions.length ||
      questionStates.size !== session.questions.length);

  useEffect(() => {
    if (!session || !needsSessionInit) return;

    const questionIds = session.questions.map((q: ExamQuestion) => q.id);
    const questionSubjects = session.questions.map(
      (q: ExamQuestion) => q.subject,
    );

    prevIndexRef.current = null;
    initSession(
      examId,
      questionIds,
      session.timeAllowedSeconds,
      session.startedAt,
      questionSubjects,
    );

    // After session init, attempt to restore any saved answer progress from IDB.
    // This handles the crash-recovery scenario: user was mid-exam, tab crashed,
    // user reopens — answers are recovered from IndexedDB.
    restoreFromIDB();
  }, [session, needsSessionInit, examId, initSession, restoreFromIDB]);

  useEffect(() => {
    if (!session) return;

    const questions = session.questions;
    const currentQuestion = questions[currentIndex];

    if (
      prevIndexRef.current !== null &&
      prevIndexRef.current !== currentIndex
    ) {
      const previousQuestion = questions[prevIndexRef.current];
      if (previousQuestion) {
        recordTimeSpent(previousQuestion.id);
      }
    }

    if (currentQuestion) {
      markEntered(currentQuestion.id);
    }

    prevIndexRef.current = currentIndex;
  }, [currentIndex, session, markEntered, recordTimeSpent]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      // Shortcuts with a modifier belong to the browser (Ctrl+F, Ctrl+P ...).
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // While a menu, the ribbon drawer or a dialog is open, keys belong to it.
      if (menuOpen || ribbonOpen || submitDialogOpen || timeExpiredModalOpen || abandonDialogOpen) return;

      const key = event.key.toLowerCase();
      const isLast = currentIndex === (session?.questions.length ?? 0) - 1;

      if (key === "s") {
        event.preventDefault();
        setSubmitDialogOpen(true);
        return;
      }

      if (key === "f") {
        const question = session?.questions?.[currentIndex];
        if (!question) return;
        event.preventDefault();
        toggleFlag(question.id);
        return;
      }

      // Inside the ribbon the arrow keys move between its cells instead.
      const inRibbon = event.target instanceof HTMLElement && !!event.target.closest("[data-ribbon]");
      const isArrow = event.key === "ArrowRight" || event.key === "ArrowLeft";
      if (isArrow && inRibbon) return;

      if (event.key === "ArrowRight" || key === "n") {
        event.preventDefault();
        if (isLast) setSubmitDialogOpen(true);
        else nextQuestion();
        return;
      }

      if (event.key === "ArrowLeft" || key === "p") {
        event.preventDefault();
        prevQuestion();
        return;
      }

      if (["a", "b", "c", "d", "e"].includes(key)) {
        const question = session?.questions?.[currentIndex];
        if (!question) return;

        const optionKey = key.toUpperCase() as "A" | "B" | "C" | "D" | "E";
        const hasText = question[`option${optionKey}` as keyof typeof question];
        const hasImage =
          question[`option${optionKey}ImageUrl` as keyof typeof question];

        if (!hasText && !hasImage) {
          return;
        }

        event.preventDefault();

        const currentState = questionStates.get(question.id);
        if (currentState?.answer === optionKey) {
          setAnswer(question.id, null);
          return;
        }

        setAnswer(question.id, optionKey);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    nextQuestion,
    prevQuestion,
    questionStates,
    session,
    setAnswer,
    setSubmitDialogOpen,
    toggleFlag,
    menuOpen,
    ribbonOpen,
    submitDialogOpen,
    timeExpiredModalOpen,
    abandonDialogOpen,
  ]);

  // Auto-advance: once a new answer is chosen on this question, move on.
  // Clearing an answer, or arriving on an answered question, does not count.
  const currentQuestionId = session?.questions[currentIndex]?.id ?? null;
  const currentAnswer = currentQuestionId !== null ? (questionStates.get(currentQuestionId)?.answer ?? null) : null;
  const lastSeenAnswer = useRef<{ id: number | null; answer: string | null }>({ id: null, answer: null });
  useEffect(() => {
    const prev = lastSeenAnswer.current;
    lastSeenAnswer.current = { id: currentQuestionId, answer: currentAnswer };
    if (!autoAdvance || prev.id !== currentQuestionId) return;
    if (!currentAnswer || currentAnswer === prev.answer) return;
    if (currentIndex >= (session?.questions.length ?? 0) - 1) return;
    const t = setTimeout(nextQuestion, 300);
    return () => clearTimeout(t);
  }, [autoAdvance, currentAnswer, currentQuestionId, currentIndex, nextQuestion, session?.questions.length]);

  useEffect(() => {
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    return () => {
      resetTimeoutRef.current = setTimeout(() => {
        reset();
        resetTimeoutRef.current = null;
      }, 0);
    };
  }, [reset]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const autoSubmitRef = useRef<() => void>(() => {});

  const { guardState, dismissViolation } = useExamGuard({
    mode: "exam",
    onAutoSubmit: () => autoSubmitRef.current(),
    // Disable guard during intentional submission states so in-app confirmation
    // and submit retries are not misclassified as leaving the exam.
    enabled:
      !!session &&
      !isLoading &&
      storeExamId === examId &&
      !submitDialogOpen &&
      !timeExpiredModalOpen &&
      !submitMutation.isPending,
  });

  const handleSubmit = useCallback(async () => {
    if (!session) return;

    const currentQuestion = session.questions[currentIndex];
    if (currentQuestion) {
      recordTimeSpent(currentQuestion.id);
    }

    const answers = buildSubmitPayload();

    try {
      const result = await submitMutation.mutateAsync({
        examId,
        payload: { answers },
      });

      setSubmitDialogOpen(false);
      setTimeExpiredModalOpen(false);
      reset();

      // Clean up IDB answer progress after successful submission
      offlineStore.clearAnswerProgress(examId).catch(() => {});

      if ("queued" in result) {
        router.push("/dashboard");
        return;
      }

      let bookmarkParams = "";
      if (result && "autoBookmarkResult" in result && result.autoBookmarkResult) {
        const { savedCount, attemptedCount, limitReached } = result.autoBookmarkResult;
        bookmarkParams = `bmSaved=${savedCount}&bmAttempted=${attemptedCount}&bmLimit=${limitReached ? "1" : "0"}`;
      }

      if (duelSession && duelCode) {
        const refreshedSession = await refetchDuelSession().catch(() => null);
        const latestSession = refreshedSession?.data?.session ?? duelSession;
        const latestOpponent = latestSession.participants.find(
          (participant) =>
            typeof myUserId === "number" && participant.userId !== myUserId,
        );

        if (latestSession.status === "COMPLETED") {
          const params = new URLSearchParams();
          params.set("duel", duelCode);
          if (bookmarkParams) {
            params.set("bmSaved", result.autoBookmarkResult!.savedCount.toString());
            params.set("bmAttempted", result.autoBookmarkResult!.attemptedCount.toString());
            params.set("bmLimit", result.autoBookmarkResult!.limitReached ? "1" : "0");
          }
          router.push(`/exams/${examId}/results?${params.toString()}`);
          return;
        }

        if (latestOpponent?.participantState === "FINISHED") {
          markOpponentFinished();
        }

        // The marking screen waits for the rival, then marks both papers.
        const params = new URLSearchParams({ duel: duelCode });
        if (bookmarkParams) {
          params.set("bmSaved", result.autoBookmarkResult!.savedCount.toString());
          params.set("bmAttempted", result.autoBookmarkResult!.attemptedCount.toString());
          params.set("bmLimit", result.autoBookmarkResult!.limitReached ? "1" : "0");
        }
        router.push(`/exams/${examId}/results?${params.toString()}`);
        return;
      }

      if (isGhostRace) {
        router.push(`/dashboard/duel/ghost/${examId}` as Route);
        return;
      }

      const redirectUrl = bookmarkParams
        ? `/exams/${examId}/results?${bookmarkParams}`
        : `/exams/${examId}/results`;
      router.push(redirectUrl as any);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to submit exam. Your answers are saved, try again.";

      toast.error(message);
      dismissViolation({ showToast: false });
    }
  }, [
    session,
    currentIndex,
    recordTimeSpent,
    buildSubmitPayload,
    submitMutation,
    examId,
    setSubmitDialogOpen,
    setTimeExpiredModalOpen,
    reset,
    router,
    dismissViolation,
    duelSession,
    duelCode,
    refetchDuelSession,
    myUserId,
    markOpponentFinished,
    isGhostRace,
  ]);

  useEffect(() => {
    autoSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const handleAbandon = useCallback(async () => {
    try {
      await abandonMutation.mutateAsync(examId);
      setAbandonDialogOpen(false);
      reset();

      // Clean up all IDB state for this exam
      offlineStore.clearAnswerProgress(examId).catch(() => {});
      offlineStore.clearExamSession(examId).catch(() => {});

      router.push("/dashboard");
      toast.success("Exam abandoned.");
    } catch {
      toast.error("Failed to abandon exam. Try again.");
    }
  }, [examId, abandonMutation, setAbandonDialogOpen, reset, router]);

  const ghost = useGhostPosition(examId, session?.questions.length ?? 0, isGhostRace);
  const tints = useMemo(() => {
    const own = paperColours(subjectRanges.map((r) => r.subject));
    return paperColourOn ? own : own.map(() => FLAT_COLOUR);
  }, [subjectRanges, paperColourOn]);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (isLoading) {
    return <ExamLoading />;
  }

  if (isError || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sb-bg)] p-4">
        <ErrorState
          title="Couldn't load your exam"
          description={
            (error as Error)?.message ||
            "The exam session may have expired or been submitted already."
          }
          actionLabel="Back to dashboard"
          onAction={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const questionIds = questions.map((q: ExamQuestion) => q.id);

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sb-bg)]">
        <p className="text-white/40">No questions available.</p>
      </div>
    );
  }

  // ─── Where we are: the paper, its range, and pace in it ───
  // Without subject ranges (should not happen) the whole sitting is one paper.
  const ranges =
    subjectRanges.length > 0
      ? subjectRanges
      : [{ subject: currentQuestion.subject, startIndex: 0, endIndex: questions.length - 1, count: questions.length }];
  const paper = paperOfIndex(ranges, currentIndex);
  const range = ranges[paper];
  const tint = tints[paper] ?? FLAT_COLOUR;
  const posInPaper = currentIndex - range.startIndex;
  const budgetSeconds = session.timeAllowedSeconds / ranges.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const currentFlagged = !!questionStates.get(currentQuestion.id)?.flagged;

  const placeOf = (index: number) => {
    const k = paperOfIndex(ranges, index);
    return `${paperLabel(ranges[k].subject).slice(0, 3)} ${index - ranges[k].startIndex + 1}`;
  };

  // ─── The rival: a duel opponent or the ghost ───
  const rival =
    duelSession && opponent
      ? {
          name: opponent.fullName,
          index: opponentProgress ? opponentProgress.current - 1 : null,
          finished: opponentFinished,
          incoming: incomingReaction,
          onReact: sendReaction as ((key: string) => void) | null,
        }
      : isGhostRace && ghost
        ? { name: "Ghost", index: ghost.question - 1, finished: ghost.finished, incoming: null, onReact: null }
        : null;
  const rivalOnRibbon = rival && !rival.finished ? rival.index : null;
  const rivalProps = rival
    ? {
        rivalName: rival.name,
        rivalIndex: rival.index,
        rivalFinished: rival.finished,
        myIndex: currentIndex,
        placeOf,
        incoming: rival.incoming,
        onReact: rival.onReact,
      }
    : null;

  const goToPaper = (k: number) => {
    if (k === paper) return;
    const r = ranges[k];
    let at = r.startIndex;
    for (let i = r.startIndex; i <= r.endIndex; i++) {
      if (!questionStates.get(questionIds[i])?.answer) {
        at = i;
        break;
      }
    }
    goToQuestion(at);
  };
  const goNext = () => (isLast ? setSubmitDialogOpen(true) : nextQuestion());

  return (
    <div
      className={cn(tk.tokens, s.app)}
      style={{ "--paper": tint, "--paper-s": softColour(tint), "--ts": textScale(textSize) } as CSSProperties}
    >
      <div className="sb-print-watermark" />

      <ExamSecurityOverlay
        guardState={guardState}
        onDismiss={dismissViolation}
        mode="exam"
      />

      <PaperRail
        questionIds={questionIds}
        tints={tints}
        timeAllowedSeconds={session.timeAllowedSeconds}
        isOnline={isOnline}
        rivalPill={rivalProps ? <RivalPill {...rivalProps} variant="pill" /> : null}
        rivalChip={rivalProps ? <RivalPill {...rivalProps} variant="chip" /> : null}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onSubmit={() => setSubmitDialogOpen(true)}
        onGoToPaper={goToPaper}
        menu={
          menuOpen ? (
            <ExamMenu
              autoAdvance={autoAdvance}
              onCalculator={() => {
                setMenuOpen(false);
                setIsCalculatorOpen((v) => !v);
              }}
              onToggleAutoAdvance={() => setAutoAdvanceOverride(!autoAdvance)}
              onLeave={() => {
                setMenuOpen(false);
                setAbandonDialogOpen(true);
              }}
              onClose={closeMenu}
            />
          ) : null
        }
      />

      <div className={s.middle}>
        <ExamReading
          questions={questions}
          index={currentIndex}
          paperName={paperLabel(range.subject)}
          numberInPaper={posInPaper + 1}
          paperCount={range.count}
          paperStart={range.startIndex}
        />
        {/* One calculator: in the right pane on a laptop; on a phone the
            pane box collapses and the calculator shows as a bottom sheet. */}
        {isCalculatorOpen ? (
          <aside className={cn(s.calcPane, "contents md:block")} aria-label="Calculator">
            <ExamCalculator docked onClose={() => setIsCalculatorOpen(false)} />
          </aside>
        ) : null}
      </div>

      <QuestionRibbon
        range={range}
        questionIds={questionIds}
        budgetSeconds={budgetSeconds}
        rivalIndex={rivalOnRibbon}
        rivalName={rival ? firstName(rival.name) : null}
        onGo={goToQuestion}
        onPrev={prevQuestion}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
      />

      <nav className={s.thumb} aria-label="Question navigation">
        <button type="button" className={s.tb} onClick={prevQuestion} disabled={isFirst}>
          <ChevronLeft aria-hidden="true" />
          <span>Back</span>
        </button>
        <button type="button" className={s.tb} onClick={() => setRibbonOpen(true)} aria-label="All questions in this paper">
          <Rows2 aria-hidden="true" />
          <span className={s.num}>
            {posInPaper + 1}/{range.count}
          </span>
        </button>
        <button
          type="button"
          className={cn(s.tb, currentFlagged && s.tbMarked)}
          onClick={() => toggleFlag(currentQuestion.id)}
          aria-pressed={currentFlagged}
        >
          <Flag aria-hidden="true" />
          <span>Mark</span>
        </button>
        <button type="button" className={cn(s.tb, s.tbNext)} onClick={goNext}>
          <span>{isLast ? "Finish" : "Next"}</span>
          <ChevronRight aria-hidden="true" />
        </button>
      </nav>

      {ribbonOpen ? (
        <div className={s.drawer} onClick={() => setRibbonOpen(false)}>
          <div className={s.drawerPanel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Questions in this paper">
            <div className={s.drawerBar}>
              <h2>
                {paperLabel(range.subject)} · {answeredInPaper(range, questionIds, questionStates)} of {range.count} answered
              </h2>
              <button type="button" className={s.iconBtn} onClick={() => setRibbonOpen(false)} aria-label="Close">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className={s.drawerScroll}>
              <RibbonCells
                range={range}
                questionIds={questionIds}
                budgetSeconds={budgetSeconds}
                rivalIndex={rivalOnRibbon}
                rivalName={rival ? firstName(rival.name) : null}
                onGo={(i) => {
                  goToQuestion(i);
                  setRibbonOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <SubmitDialog
        onConfirm={handleSubmit}
        isSubmitting={submitMutation.isPending}
        duelRivalName={duelSession && opponent ? opponentFirstName : null}
        tints={tints}
      />
      <AbandonDialog
        onConfirm={handleAbandon}
        isAbandoning={abandonMutation.isPending}
      />
      <TimeExpiredModal onAutoSubmit={handleSubmit} />

    </div>
  );
}
