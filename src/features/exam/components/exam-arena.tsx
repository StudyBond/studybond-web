"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

type ExamArenaProps = {
  examId: number;
};

export function ExamArena({ examId }: ExamArenaProps) {
  const router = useRouter();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

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
  const setSubmitDialogOpen = useExamStore((s) => s.setSubmitDialogOpen);
  const setAbandonDialogOpen = useExamStore((s) => s.setAbandonDialogOpen);
  const setTimeExpiredModalOpen = useExamStore((s) => s.setTimeExpiredModalOpen);

  const submitMutation = useSubmitExamMutation();
  const abandonMutation = useAbandonExamMutation();

  const prevIndexRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [session, needsSessionInit, examId, initSession]);

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
    enabled: !!session && !isLoading && storeExamId === examId,
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

      if ("queued" in result) {
        router.push("/dashboard");
        return;
      }

      router.push(`/exams/${examId}/results`);
    } catch {
      toast.error("Failed to submit exam. Your answers are saved, try again.");
      dismissViolation();
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
  ]);

  autoSubmitRef.current = handleSubmit;

  const handleAbandon = useCallback(async () => {
    try {
      await abandonMutation.mutateAsync(examId);
      setAbandonDialogOpen(false);
      reset();
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
    </div>
  );
}
