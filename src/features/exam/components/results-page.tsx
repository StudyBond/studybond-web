"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import { useExamDetail } from "@/features/exam/hooks/use-exam-detail";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import { useReviewLockout } from "@/features/exam/hooks/use-review-lockout";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { ScoreSummary } from "@/features/exam/components/score-summary";
import { SubjectBreakdown } from "@/features/exam/components/subject-breakdown";
import { AnswerReview } from "@/features/exam/components/answer-review";
import { RetakeButton } from "@/features/exam/components/retake-button";
import { ShareResultCard } from "@/features/exam/components/share-result-card";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { ReviewLockedPage } from "@/features/exam/components/review-locked-page";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCollaborationSession } from "@/features/collaboration/hooks/use-collaboration";
import { DuelResultsPage } from "@/features/collaboration/components/duel-results-page";
import { DuelWaitingLobby } from "@/features/collaboration/components/duel-waiting-lobby";

export function ResultsPageClient({ examId }: { examId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collabCode = searchParams.get("collab");

  const critical = useDashboardCriticalData();
  const {
    data: result,
    isLoading: isResultLoading,
    isError,
    error,
  } = useExamDetail(examId);

  const { data: collabData, isLoading: isCollabLoading } =
    useCollaborationSession(collabCode || "", !!collabCode);
  const collabSession = collabData?.session;

  // Show auto-bookmarking limits feedback toast immediately after loading results
  useEffect(() => {
    if (isResultLoading || !result) return;

    const bmSaved = searchParams.get("bmSaved");
    const bmAttempted = searchParams.get("bmAttempted");
    const bmLimit = searchParams.get("bmLimit") === "1";

    if (bmAttempted !== null && bmSaved !== null) {
      const saved = parseInt(bmSaved, 10);
      const attempted = parseInt(bmAttempted, 10);

      if (bmLimit) {
        if (saved === 0 && attempted > 0) {
          toast.error(
            `Bookmark limit reached! None of your ${attempted} flagged question${attempted > 1 ? "s" : ""} could be saved.`,
            {
              duration: 6000,
              icon: "⚠️",
              description: "Clear some bookmarks or upgrade to Premium to get more space.",
            }
          );
        } else if (saved < attempted) {
          toast.warning(
            `Saved ${saved} of ${attempted} flagged questions. Vault limit reached!`,
            {
              duration: 6000,
              icon: "⚠️",
              description: "Clear some bookmarks or upgrade to Premium to save the rest.",
            }
          );
        }
      } else if (saved > 0) {
        toast.success(
          `Successfully saved ${saved} flagged question${saved > 1 ? "s" : ""} to your study vault.`,
          {
            duration: 4000,
            icon: "🔖",
          }
        );
      }

      // Clean up query parameters from URL to avoid repeating toast on refresh
      const url = new URL(window.location.href);
      if (url.searchParams.has("bmSaved") || url.searchParams.has("bmAttempted") || url.searchParams.has("bmLimit")) {
        url.searchParams.delete("bmSaved");
        url.searchParams.delete("bmAttempted");
        url.searchParams.delete("bmLimit");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
  }, [result, isResultLoading, searchParams]);

  // ─── Progressive review lockout ───
  const {
    isLocked,
    isPermanentlyLocked,
    isInLastChance,
    violationsBeforeLockout,
    canRequestLastChance,
    lastChanceCooldownRemaining,
    recordViolation,
    requestLastChance,
  } = useReviewLockout(examId);

  // ─── Anti-cheat guard (review mode) ───
  const { guardState, dismissViolation } = useExamGuard({
    mode: "review",
    enabled: !isLocked && !!result,
  });

  // ─── Intercept screenshot violations from the guard ───
  // We wrap dismissViolation to also record the violation in the lockout system
  const handleDismissViolation = useCallback(() => {
    dismissViolation();

    // Record the violation — if it crosses the threshold, lock and redirect
    const nowLocked = recordViolation();

    if (nowLocked) {
      // Small delay so the user sees the toast before redirect
      if (isPermanentlyLocked) {
        toast.error(
          "Review access has been permanently revoked due to repeated violations.",
          {
            duration: 5000,
            icon: "🔒",
          },
        );
      } else {
        toast.error(
          "Review access has been temporarily locked due to suspicious activity.",
          {
            duration: 5000,
            icon: "⚠️",
          },
        );
      }
    } else if (isInLastChance) {
      toast.warning(
        `Warning — ${violationsBeforeLockout} attempt${violationsBeforeLockout !== 1 ? "s" : ""} remaining before review is locked again.`,
        { duration: 4000, icon: "🛡️" },
      );
    } else {
      toast.warning(
        `Screenshot detected — ${violationsBeforeLockout} attempt${violationsBeforeLockout !== 1 ? "s" : ""} remaining before review is locked.`,
        { duration: 3000, icon: "🛡️" },
      );
    }
  }, [
    dismissViolation,
    recordViolation,
    isPermanentlyLocked,
    isInLastChance,
    violationsBeforeLockout,
  ]);

  // ─── Loading ───
  if (critical.isLoading || isResultLoading || isCollabLoading) {
    return (
      <LearnerShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
        </div>
      </LearnerShell>
    );
  }

  if (critical.isError || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-red-400">
          Failed to load essential data.
        </div>
      </LearnerShell>
    );
  }

  if (isError || !result) {
    return (
      <LearnerShell profile={critical.profile.data}>
        <div className="py-12">
          <ErrorState
            title="Failed to load results."
            description={
              (error as Error)?.message ||
              "The results for this exam session could not be found."
            }
            onAction={() => router.push("/dashboard")}
            actionLabel="Return Home"
          />
        </div>
      </LearnerShell>
    );
  }

  // ─── Locked state — show lockout page instead of results (Exams only) ───
  if (isLocked && result.examType !== "STUDY") {
    return (
      <LearnerShell profile={critical.profile.data}>
        <ReviewLockedPage
          examId={examId}
          isPermanent={isPermanentlyLocked}
          canRequestLastChance={canRequestLastChance()}
          cooldownMinutes={lastChanceCooldownRemaining()}
          onRequestLastChance={requestLastChance}
        />
      </LearnerShell>
    );
  }

  // ─── Duel Results View ───
  if (result.examType === "ONE_V_ONE_DUEL" && collabSession) {
    const profile = critical.profile.data;
    const me = profile
      ? collabSession.participants.find(
          (participant) => participant.userId === profile.id,
        )
      : undefined;
    const opponent = profile
      ? collabSession.participants.find(
          (participant) => participant.userId !== profile.id,
        )
      : undefined;
    const isDuelComplete = collabSession.status === "COMPLETED";

    if (!isDuelComplete) {
      return (
        <LearnerShell profile={critical.profile.data}>
          <DuelWaitingLobby
            opponentName={opponent?.fullName ?? "Your opponent"}
            opponentProgress={null}
            opponentFinished={opponent?.participantState === "FINISHED"}
            myScore={result.score}
            myTotalQuestions={result.totalQuestions}
            myTimeTaken={result.timeTakenSeconds}
          />
        </LearnerShell>
      );
    }

    return (
      <LearnerShell profile={critical.profile.data}>
        <div className="sb-print-watermark" />
        <ExamSecurityOverlay
          guardState={guardState}
          onDismiss={handleDismissViolation}
          mode="review"
        />
        <DuelResultsPage
          result={result}
          collabSession={collabSession}
          myUserId={critical.profile.data.id}
        />
      </LearnerShell>
    );
  }

  const isStudySession = result.examType === "STUDY";

  // ─── Results view (with active protection for exams, relaxed for study sessions) ───
  return (
    <LearnerShell profile={critical.profile.data}>
      {/* Print watermark */}
      <div className="sb-print-watermark" />

      {/* Security overlay — only for actual timed exams, NOT study sessions */}
      {!isStudySession && (
        <ExamSecurityOverlay
          guardState={guardState}
          onDismiss={handleDismissViolation}
          mode="review"
        />
      )}

      <div className="mx-auto w-full max-w-5xl py-6 pb-24 md:py-12 space-y-7 md:space-y-12 sb-exam-content">
        {/* Restricted phase warning banner */}
        {!isStudySession && isInLastChance && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-5 py-3 animate-in fade-in slide-in-from-top-4 duration-500 z-10 relative">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
              🛡️
            </span>
            <p className="text-[11px] text-amber-400/70 font-medium leading-relaxed">
              You're in a{" "}
              <span className="font-bold text-amber-400">restricted phase</span>
              . Further screenshot attempts will lock your access to this review
              with escalating penalties.
            </p>
          </div>
        )}

        {/* Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            href="/dashboard"
            className="-ml-2 text-white/50 hover:text-white"
          >
            <>
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </>
          </Button>

          <div className="flex items-center gap-3">
            <ShareResultCard result={result} />
            {isStudySession ? (
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-10 px-4"
                href={"/dashboard/study" as Route}
              >
                <>Start New Study Session</>
              </Button>
            ) : (
              <RetakeButton examId={examId} />
            )}
          </div>
        </div>

        {/* Hero: Score & Summary */}
        <ScoreSummary result={result} />

        {/* Breakdown Row */}
        <div className="flex flex-col gap-6 items-start lg:flex-row lg:gap-8">
          {/* Detailed Review */}
          <div className="w-full lg:flex-1 order-2 lg:order-1 min-w-0">
            <AnswerReview result={result} />
          </div>

          {/* Sidebar: Subject breakdown */}
          <div className="w-full lg:w-[300px] shrink-0 order-1 lg:order-2 lg:sticky lg:top-24">
            <SubjectBreakdown result={result} />
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
