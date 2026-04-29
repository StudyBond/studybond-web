"use client";

import { ExamTimer } from "@/features/exam/components/exam-timer";
import { useExamStore } from "@/features/exam/stores/exam-store";
import { cn } from "@/lib/utils/cn";
import { Grid3X3, LogOut, SendHorizontal, Calculator } from "lucide-react";

type ExamHeaderProps = {
  displayName: string;
  subjects: string[];
  isCalculatorOpen?: boolean;
  onToggleCalculator?: () => void;
};

export function ExamHeader({ displayName, subjects, isCalculatorOpen, onToggleCalculator }: ExamHeaderProps) {
  const currentIndex = useExamStore((s) => s.currentIndex);
  const totalQuestions = useExamStore((s) => s.totalQuestions);
  const getAnsweredCount = useExamStore((s) => s.getAnsweredCount);
  const toggleNavigator = useExamStore((s) => s.toggleNavigator);
  const setSubmitDialogOpen = useExamStore((s) => s.setSubmitDialogOpen);
  const setAbandonDialogOpen = useExamStore((s) => s.setAbandonDialogOpen);

  const answered = getAnsweredCount();
  const progress = totalQuestions > 0 ? (answered / totalQuestions) * 100 : 0;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--sb-bg)]/90 backdrop-blur-xl" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.03]">
        <div
          className="h-full bg-gradient-to-r from-[var(--sb-accent)] to-[var(--sb-gold)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        {/* Left: Exam info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Abandon button */}
          <button
            onClick={() => setAbandonDialogOpen(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/20 transition-all hover:border-red-400/20 hover:bg-red-400/[0.05] hover:text-red-400/70"
            title="Leave exam"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>

          {/* Exam title (hidden on small mobile) */}
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/15 truncate">
              {displayName}
            </span>
            <div className="flex items-center gap-1.5">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="text-[8px] font-bold uppercase tracking-wider text-white/25 bg-white/[0.03] px-1.5 py-0.5 rounded"
                >
                  {s.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Timer + progress counter */}
        <div className="flex items-center gap-3">
          <ExamTimer />
          <span className="hidden md:inline-flex sb-mono text-[11px] font-semibold text-white/20">
            {answered}/{totalQuestions}
          </span>
        </div>

        {/* Right: Navigator toggle + Submit */}
        <div className="flex items-center gap-2">
          {/* Calculator toggle */}
          <button
            onClick={onToggleCalculator}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
              isCalculatorOpen
                ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/[0.08] text-[var(--sb-accent)]"
                : "border-white/[0.06] bg-white/[0.02] text-white/30 hover:bg-white/[0.06] hover:text-white/50",
            )}
            title="Calculator"
          >
            <Calculator className="h-3.5 w-3.5" />
          </button>

          {/* Navigator toggle */}
          <button
            onClick={toggleNavigator}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
              "border-white/[0.06] bg-white/[0.02] text-white/30 hover:bg-white/[0.06] hover:text-white/50",
            )}
            title="Question navigator"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>

          {/* Submit button */}
          <button
            onClick={() => setSubmitDialogOpen(true)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all duration-200",
              answered === totalQuestions
                ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400"
                : "bg-white/[0.05] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/60",
            )}
          >
            <SendHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
