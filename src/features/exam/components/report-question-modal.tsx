"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { useReportQuestion } from "@/features/exam/hooks/use-report-question";
import type { ReportIssueType } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import {
  X,
  Flag,
  Check,
  AlertCircle,
  Loader2,
  CircleOff,
  Type,
  HelpCircle,
  ImageOff,
  MessageSquare,
} from "lucide-react";

// ── Issue type options ──────────────────────────────────

const ISSUE_OPTIONS: {
  value: ReportIssueType;
  label: string;
  description: string;
  icon: typeof AlertCircle;
}[] = [
  {
    value: "WRONG_ANSWER",
    label: "Wrong answer",
    description: "The marked correct answer is incorrect",
    icon: CircleOff,
  },
  {
    value: "TYPO",
    label: "Typo or error",
    description: "Spelling, grammar, or formatting issue",
    icon: Type,
  },
  {
    value: "AMBIGUOUS",
    label: "Ambiguous",
    description: "The question or options are unclear",
    icon: HelpCircle,
  },
  {
    value: "IMAGE_MISSING",
    label: "Missing image",
    description: "An image failed to load or is missing",
    icon: ImageOff,
  },
  {
    value: "OTHER",
    label: "Other issue",
    description: "Something else is wrong with this question",
    icon: MessageSquare,
  },
];

// ── Component ───────────────────────────────────────────

type ReportQuestionModalProps = {
  questionId: number;
  questionNumber: number;
  subject: string;
  open: boolean;
  onClose: () => void;
};

export function ReportQuestionModal({
  questionId,
  questionNumber,
  subject,
  open,
  onClose,
}: ReportQuestionModalProps) {
  const mutation = useReportQuestion();

  const [selectedType, setSelectedType] = useState<ReportIssueType | null>(null);
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"select" | "success">("select");

  const resetState = useCallback(() => {
    setSelectedType(null);
    setDescription("");
    setStep("select");
    mutation.reset();
  }, [mutation]);

  function handleClose() {
    onClose();
    // Delay reset to allow exit animation
    setTimeout(resetState, 300);
  }

  async function handleSubmit() {
    if (!selectedType) return;

    // "OTHER" requires a description
    const trimmedDesc = description.trim();
    if (selectedType === "OTHER" && trimmedDesc.length < 5) return;

    try {
      await mutation.mutateAsync({
        questionId,
        issueType: selectedType,
        description: trimmedDesc || null,
      });
      setStep("success");
    } catch {
      // error state handled by mutation
    }
  }

  const canSubmit =
    selectedType !== null &&
    (selectedType !== "OTHER" || description.trim().length >= 5) &&
    !mutation.isPending;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 md:fade-in duration-300">
        <div className="rounded-t-3xl md:rounded-2xl border border-white/[0.08] bg-[var(--sb-bg-surface-1)] shadow-2xl shadow-black/40 overflow-hidden">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Flag className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Report an issue</h3>
              <p className="text-[10px] text-white/30 truncate">
                Q{questionNumber} · {subject}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 hover:bg-white/[0.04] hover:text-white/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto sb-scroll-hide">
            {step === "success" ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center py-8 text-center animate-in zoom-in-95 fade-in duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400 mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Report submitted
                </h4>
                <p className="text-xs text-white/40 max-w-[240px] leading-relaxed">
                  Thank you for helping us improve. Our team will review this
                  question shortly.
                </p>
              </div>
            ) : (
              /* ── Issue type selection ── */
              <div className="space-y-3">
                <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">
                  What&apos;s wrong with this question?
                </p>

                <div className="space-y-2">
                  {ISSUE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedType(option.value)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                          isSelected
                            ? "border-amber-400/30 bg-amber-400/[0.06] ring-1 ring-amber-400/10"
                            : "border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08]",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isSelected
                              ? "bg-amber-400/15 text-amber-400"
                              : "bg-white/[0.04] text-white/25",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium transition-colors",
                              isSelected ? "text-white" : "text-white/60",
                            )}
                          >
                            {option.label}
                          </p>
                          <p className="text-[10px] text-white/25 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                            isSelected
                              ? "border-amber-400 bg-amber-400"
                              : "border-white/10 bg-transparent",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-black" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Description textarea — always visible but required only for OTHER */}
                {selectedType && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
                      Additional details{" "}
                      {selectedType === "OTHER" ? (
                        <span className="text-amber-400/60">(required)</span>
                      ) : (
                        <span className="text-white/15">(optional)</span>
                      )}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        selectedType === "OTHER"
                          ? "Describe what's wrong with this question..."
                          : "Add any extra context (optional)..."
                      }
                      maxLength={2000}
                      rows={3}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none transition-all resize-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/10 focus:bg-white/[0.03]"
                    />
                    {selectedType === "OTHER" &&
                      description.trim().length > 0 &&
                      description.trim().length < 5 && (
                        <p className="text-[10px] text-amber-400/60">
                          Please write at least 5 characters.
                        </p>
                      )}
                  </div>
                )}

                {/* Error */}
                {mutation.isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-400/[0.03] p-3 text-xs text-red-400/80 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {mutation.error instanceof ApiError
                        ? mutation.error.message
                        : "Something went wrong. Please try again."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-white/[0.06] px-5 py-4">
            {step === "success" ? (
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-white/[0.04] py-3 text-sm font-bold text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Done
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300",
                  canSubmit
                    ? "bg-amber-500/15 text-amber-400 border border-amber-400/20 hover:bg-amber-500/25"
                    : "bg-white/[0.02] text-white/15 border border-white/[0.04] cursor-not-allowed",
                )}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="h-3.5 w-3.5" />
                    Submit report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
