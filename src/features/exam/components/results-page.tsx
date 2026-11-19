"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useExamDetail } from "@/features/exam/hooks/use-exam-detail";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import { useReviewLockout } from "@/features/exam/hooks/use-review-lockout";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { ResultsView } from "@/features/exam/components/results-view";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { ReviewLockedPage } from "@/features/exam/components/review-locked-page";
import { ErrorState } from "@/components/ui/error-state";
import { Loader2 } from "lucide-react";
import { useDuelSession } from "@/features/duel/hooks/use-duel";
import { DuelOutcome } from "@/features/duel/result/duel-outcome";

export function ResultsPageClient({ examId }: { examId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // "collab" is the old name; links saved before the duel rename still use it.
  const duelCode = searchParams.get("duel") ?? searchParams.get("collab");

  const critical = useDashboardCriticalData();
  const {
    data: result,
    isLoading: isResultLoading,
    isError,
    error,
  } = useExamDetail(examId);

  // The board's scale (JAMB 400, UI Post-UTME 100) sets the headline mark,
  // so wait for it rather than flash the wrong one. Usually already cached.
  const { isLoading: isProfileLoading } = useExamProfile();

  const { data: duelData, isLoading: isDuelLoading } =
    useDuelSession(duelCode || "", !!duelCode);
  const duelSession = duelData?.session;

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
  if (critical.isLoading || isResultLoading || isDuelLoading || isProfileLoading) {
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

  // ─── Duel: marking, then the result (mockup boards 5-6) ───
  if (result.examType === "ONE_V_ONE_DUEL" && duelSession && duelCode) {
    return (
      <LearnerShell profile={critical.profile.data}>
        <div className="sb-print-watermark" />
        <ExamSecurityOverlay
          guardState={guardState}
          onDismiss={handleDismissViolation}
          mode="review"
        />
        <DuelOutcome result={result} code={duelCode} profile={critical.profile.data} />
      </LearnerShell>
    );
  }

  const isStudySession = result.examType === "STUDY";

  // ─── Results view (with active protection for exams, relaxed for study sessions) ───
  // A full screen of its own, like the exam: the bar carries Dashboard,
  // Share and Retake, so the learner shell is left out here.
  return (
    <>
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

      <ResultsView
        result={result}
        examId={examId}
        restricted={!isStudySession && isInLastChance}
      />
    </>
  );
}
