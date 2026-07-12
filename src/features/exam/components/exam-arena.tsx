"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { ErrorState } from "@/components/ui/error-state";
import { ExamLoading } from "@/features/exam/components/exam-loading";
import { ExamHeader } from "@/features/exam/components/exam-header";
import { QuestionCard } from "@/features/exam/components/question-card";
import { QuestionNavigator } from "@/features/exam/components/question-navigator";
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
import { useCollaborationSession } from "@/features/collaboration/hooks/use-collaboration";
import { useDuelWebsocket } from "@/features/collaboration/hooks/use-duel-websocket";
import { DuelWaitingLobby } from "@/features/collaboration/components/duel-waiting-lobby";

const EMOJI_OPTIONS = ["🚀", "🔥", "😅", "😭", "💀", "👀"];

type ExamArenaProps = {
  examId: number;
};

export function ExamArena({ examId }: ExamArenaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // ─── Current user identity ───
  // The profile query is already warm from the dashboard shell. We read
  // from the cache to avoid an extra network round-trip.
  const { data: profile } = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getUserProfile,
  });
  const myUserId = profile?.id ?? null;

  const collabCode = searchParams.get("collab");
  const { data: collabData, refetch: refetchCollabSession } = useCollaborationSession(collabCode || "", !!collabCode);
  const collabSession = collabData?.session;

  const { data: session, isLoading, isError, error } = useExamSession(examId);

  const initSession = useExamStore((s) => s.initSession);
  const storeExamId = useExamStore((s) => s.examId);
  const totalQuestions = useExamStore((s) => s.totalQuestions);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const navigatorOpen = useExamStore((s) => s.navigatorOpen);
  const setNavigatorOpen = useExamStore((s) => s.setNavigatorOpen);
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

  const submitMutation = useSubmitExamMutation();
  const abandonMutation = useAbandonExamMutation();

  const prevIndexRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- DUEL STATE ---
  const [opponentProgress, setOpponentProgress] = useState<{ current: number; total: number } | null>(null);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [isWaitingInLobby, setIsWaitingInLobby] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string }[]>([]);
  const [hudTickKey, setHudTickKey] = useState(0);
  const opponentFinishedToastShownRef = useRef(false);

  // Identify the opponent by excluding ourselves. This is the correct
  // approach: compare against the authenticated user's numeric ID, NOT
  // the exam's displayNameLong (which is a generated title like
  // "1v1 Duel #3: Physics, Mathematics", not a person's name).
  const opponent = collabSession?.participants.find(
    (p) => typeof myUserId === "number" && p.userId !== myUserId,
  ) ?? null;

  const markOpponentFinished = useCallback(() => {
    setOpponentFinished(true);
  }, []);

  const { sendProgress, sendEmoji } = useDuelWebsocket({
    sessionId: collabSession?.id ?? null,
    myUserId,
    // The hook already filters out self-echo for client-originated events
    // (progress, emoji) using fromUserId. However, the `finished` event
    // is SERVER-originated — it goes through markParticipantFinished, not
    // emitClientRealtimeEvent — so `fromUserId` is never injected. We
    // must filter self-events manually via the userId in the payload.
    onProgressUpdate: (_fromUserId, current, total) => {
      setOpponentProgress({ current, total });
      setHudTickKey((k) => k + 1);
    },
    onEmojiReaction: (_fromUserId, emoji) => {
      const id = crypto.randomUUID();
      setFloatingEmojis((prev) => [...prev, { id, emoji }]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
      }, 4000);
    },
    onFinished: (finishedUserId) => {
      // The server's `finished` event carries `userId` (not `fromUserId`),
      // so the hook's built-in self-echo filter does NOT catch it. We must
      // explicitly ignore our own completion event here.
      if (typeof myUserId === "number" && finishedUserId === myUserId) return;
      markOpponentFinished();
      if (opponentFinishedToastShownRef.current) return;
      opponentFinishedToastShownRef.current = true;
      toast("⚡ Your opponent has submitted!", {
        description: "They're watching your progress now. Stay focused!",
        duration: 5000,
      });
    },
    onSessionCompleted: () => {
      // The server's authoritative "all participants finished" signal.
      // Force-navigate to results regardless of local state — this is the
      // definitive end-of-duel event and resolves any race conditions
      // between the two players' `finished` events.
      if (collabCode) {
        router.push(`/exams/${examId}/results?collab=${collabCode}`);
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
    toast("Your opponent has submitted!", {
      description: "They're watching your progress now. Stay focused!",
      duration: 5000,
    });
  }, [opponentFinished]);

  useEffect(() => {
    const opponentState = opponent?.participantState;
    if (opponentState === "FINISHED" || collabSession?.status === "COMPLETED") {
      // Defer state update to avoid synchronous setState inside effect which
      // can cause cascading renders. Schedule on next macrotask.
      const t = setTimeout(() => markOpponentFinished(), 0);
      return () => clearTimeout(t);
    }
  }, [collabSession?.status, markOpponentFinished, opponent?.participantState]);

  // Automatically route to results when both are finished and we are in the lobby.
  // This is the local-state fallback — the `onSessionCompleted` handler above is
  // the primary navigation trigger from the server.
  useEffect(() => {
    if (isWaitingInLobby && (opponentFinished || collabSession?.status === "COMPLETED")) {
      if (collabCode) {
        router.push(`/exams/${examId}/results?collab=${collabCode}`);
      } else {
        router.push(`/exams/${examId}/results`);
      }
    }
  }, [isWaitingInLobby, opponentFinished, router, examId, collabCode, collabSession?.status]);

  // Send progress whenever we change questions
  useEffect(() => {
    if (collabSession && session) {
      sendProgress(currentIndex + 1, session.questions.length);
    }
  }, [currentIndex, collabSession, session, sendProgress]);
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

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        setSubmitDialogOpen(true);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown" || key === "n") {
        event.preventDefault();
        nextQuestion();
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp" || key === "p") {
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
  ]);

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
      !isWaitingInLobby &&
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

      if (collabSession && collabCode) {
        const refreshedSession = await refetchCollabSession().catch(() => null);
        const latestSession = refreshedSession?.data?.session ?? collabSession;
        const latestOpponent = latestSession.participants.find(
          (participant) =>
            typeof myUserId === "number" && participant.userId !== myUserId,
        );

        if (latestSession.status === "COMPLETED") {
          const params = new URLSearchParams();
          params.set("collab", collabCode);
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

        setIsWaitingInLobby(true);
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
    collabSession,
    collabCode,
    refetchCollabSession,
    myUserId,
    markOpponentFinished,
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

  return (
    <div className="relative min-h-screen bg-[var(--sb-bg)]">
      <div className="sb-print-watermark" />

      <ExamSecurityOverlay
        guardState={guardState}
        onDismiss={dismissViolation}
        mode="exam"
      />

      <ExamHeader
        displayName={session.displayNameShort}
        subjects={session.subjects}
        isCalculatorOpen={isCalculatorOpen}
        onToggleCalculator={() => setIsCalculatorOpen((value) => !value)}
      />

      {isCalculatorOpen ? (
        <ExamCalculator onClose={() => setIsCalculatorOpen(false)} />
      ) : null}

      {/* Floating Emojis Overlay */}
      {floatingEmojis.map(({ id, emoji }, index) => (
        <div
          key={id}
          className="pointer-events-none fixed z-[300] text-5xl sb-emoji-float"
          style={{
            left: `${15 + (index % 3) * 10}%`,
            bottom: "20%",
          }}
        >
          {emoji}
        </div>
      ))}

      {/* ═══ DUEL OPPONENT HUD — Desktop ═══ */}
      {collabSession && opponent && (
        <div
          key={hudTickKey}
          className={cn(
            "fixed top-20 right-4 z-40 hidden md:block animate-in slide-in-from-right fade-in duration-500",
            hudTickKey > 0 && "sb-duel-hud-tick",
          )}
        >
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 backdrop-blur-2xl p-4 w-[200px] shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-400/10 text-sm font-bold text-white shadow-inner shadow-white/10">
                {opponent.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{opponent.fullName}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-400/50">Rival</p>
              </div>
            </div>

            {opponentFinished ? (
              <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 py-2 animate-in fade-in zoom-in-95 duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Submitted</span>
              </div>
            ) : opponentProgress ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/30">Progress</span>
                  <span className="sb-mono font-bold text-white/60">{opponentProgress.current}/{opponentProgress.total}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (opponentProgress.current / opponentProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-white/25">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
                Syncing...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ DUEL OPPONENT HUD — Mobile compact pill ═══ */}
      {collabSession && opponent && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 md:hidden animate-in slide-in-from-top fade-in duration-300">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0c0f]/80 backdrop-blur-2xl px-3 py-1.5 shadow-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15 text-[10px] font-bold text-white">
              {opponent.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-bold text-white/70 max-w-[80px] truncate">{opponent.fullName.split(" ")[0]}</span>
            {opponentFinished ? (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ) : opponentProgress ? (
              <span className="sb-mono text-[9px] font-bold text-amber-400">{opponentProgress.current}/{opponentProgress.total}</span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* ═══ DUEL EMOJI BAR ═══ */}
      {collabSession && (
        <div className="fixed bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-auto md:left-6 z-40 flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#0c0c0f]/70 backdrop-blur-2xl p-1 shadow-xl">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendEmoji(emoji)}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-lg md:text-xl transition-all duration-200 hover:scale-125 hover:bg-white/[0.1] active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex">
        <main
          className={cn(
            "flex-1 pt-16 pb-24 md:pb-8 transition-all duration-300 sb-exam-content",
            navigatorOpen ? "md:mr-[280px]" : "",
          )}
        >
          <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 sb-protected">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={questions.length}
            />

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200",
                  currentIndex === 0
                    ? "cursor-not-allowed text-white/10"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/60",
                )}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <span className="sb-mono text-[11px] font-bold text-white/15">
                {currentIndex + 1} / {questions.length}
              </span>

              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200",
                  currentIndex === questions.length - 1
                    ? "cursor-not-allowed text-white/10"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/60",
                )}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>

        <aside
          className={cn(
            "fixed right-0 top-14 bottom-0 z-30 hidden w-[280px] border-l border-white/[0.06] bg-[var(--sb-bg)] transition-transform duration-300 md:block",
            navigatorOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <QuestionNavigator questionIds={questionIds} />
        </aside>

        {navigatorOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 animate-in fade-in bg-black/50 backdrop-blur-sm duration-200"
              onClick={() => setNavigatorOpen(false)}
            />
            <aside className="absolute top-0 right-0 bottom-0 w-[280px] animate-in slide-in-from-right border-l border-white/[0.06] bg-[var(--sb-bg)] shadow-2xl duration-300">
              <QuestionNavigator questionIds={questionIds} />
            </aside>
          </div>
        ) : null}
      </div>

      <SubmitDialog
        onConfirm={handleSubmit}
        isSubmitting={submitMutation.isPending}
      />
      <AbandonDialog
        onConfirm={handleAbandon}
        isAbandoning={abandonMutation.isPending}
      />
      <TimeExpiredModal onAutoSubmit={handleSubmit} />

      {isWaitingInLobby && opponent && (
        <DuelWaitingLobby
          opponentName={opponent.fullName}
          opponentProgress={opponentProgress}
          opponentFinished={opponentFinished}
          myScore={submitMutation.data && "score" in submitMutation.data ? submitMutation.data.score : undefined}
          myTotalQuestions={session.questions.length}
          myTimeTaken={submitMutation.data && "timeTakenSeconds" in submitMutation.data ? submitMutation.data.timeTakenSeconds : undefined}
        />
      )}
    </div>
  );
}
