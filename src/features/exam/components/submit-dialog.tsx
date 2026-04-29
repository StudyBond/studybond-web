"use client";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle, SendHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitDialogProps = {
  onConfirm: () => void;
  isSubmitting: boolean;
};

export function SubmitDialog({ onConfirm, isSubmitting }: SubmitDialogProps) {
  const open = useExamStore((s) => s.submitDialogOpen);
  const setOpen = useExamStore((s) => s.setSubmitDialogOpen);
  const totalQuestions = useExamStore((s) => s.totalQuestions);
  const getAnsweredCount = useExamStore((s) => s.getAnsweredCount);
  const getUnansweredCount = useExamStore((s) => s.getUnansweredCount);
  const getFlaggedCount = useExamStore((s) => s.getFlaggedCount);

  if (!open) return null;

  const answered = getAnsweredCount();
  const unanswered = getUnansweredCount();
  const flagged = getFlaggedCount();
  const allAnswered = unanswered === 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isSubmitting && setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[var(--sb-bg-elevated)] p-6 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close */}
        {!isSubmitting ? (
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg text-white/20 hover:bg-white/[0.05] hover:text-white/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* Icon */}
        <div className={cn(
          "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
          allAnswered
            ? "bg-emerald-400/10 text-emerald-400"
            : "bg-amber-400/10 text-amber-400",
        )}>
          {allAnswered ? (
            <SendHorizontal className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-bold text-white mb-1.5">
          {allAnswered ? "Submit your exam?" : "You have unanswered questions"}
        </h2>

        <p className="text-center text-sm text-white/40 mb-6">
          {allAnswered
            ? "All questions have been answered. Submit your exam to see your results."
            : "Are you sure you want to submit? Unanswered questions will be marked as incorrect."}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="sb-mono text-lg font-bold text-emerald-400">{answered}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/20">Answered</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className={cn("sb-mono text-lg font-bold", unanswered > 0 ? "text-amber-400" : "text-white/20")}>{unanswered}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/20">Skipped</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className={cn("sb-mono text-lg font-bold", flagged > 0 ? "text-[var(--sb-accent)]" : "text-white/20")}>{flagged}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/20">Flagged</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isSubmitting ? (
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Go back
            </Button>
          ) : null}
          <Button
            size="md"
            className={cn(
              "flex-1",
              allAnswered
                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                : "",
            )}
            onClick={onConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit exam"}
          </Button>
        </div>
      </div>
    </div>
  );
}
