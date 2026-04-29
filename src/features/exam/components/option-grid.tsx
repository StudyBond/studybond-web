"use client";

import { cn } from "@/lib/utils/cn";
import type { OptionKey } from "@/features/exam/stores/exam-store";
import type { ExamQuestion } from "@/lib/api/types";
import { MathMarkdown } from "@/components/ui/math-markdown";

type OptionGridProps = {
  question: ExamQuestion;
  selectedAnswer: OptionKey | null;
  onSelect: (key: OptionKey) => void;
  disabled?: boolean;
};

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D", "E"];

function getOptionText(question: ExamQuestion, key: OptionKey): string | null {
  const map: Record<OptionKey, string | null> = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
    E: question.optionE,
  };
  return map[key];
}

function getOptionImageUrl(question: ExamQuestion, key: OptionKey): string | null {
  const map: Record<OptionKey, string | null> = {
    A: question.optionAImageUrl,
    B: question.optionBImageUrl,
    C: question.optionCImageUrl,
    D: question.optionDImageUrl,
    E: question.optionEImageUrl,
  };
  return map[key];
}

export function OptionGrid({ question, selectedAnswer, onSelect, disabled = false }: OptionGridProps) {
  return (
    <div className="space-y-2.5">
      {OPTION_KEYS.map((key) => {
        const text = getOptionText(question, key);
        const imageUrl = getOptionImageUrl(question, key);

        // Skip if no text AND no image (e.g., option E is often null)
        if (!text && !imageUrl) return null;

        const isSelected = selectedAnswer === key;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={cn(
              "group relative w-full rounded-2xl border p-4 text-left transition-all duration-200",
              "flex items-start gap-3.5",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sb-bg)]",
              isSelected
                ? "border-[var(--sb-accent)]/40 bg-[var(--sb-accent)]/[0.08] shadow-[0_0_24px_var(--sb-accent-glow)]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {/* Option letter badge */}
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200",
                isSelected
                  ? "bg-[var(--sb-accent)] text-white shadow-md"
                  : "bg-white/[0.05] text-white/40 group-hover:bg-white/[0.08] group-hover:text-white/60",
              )}
            >
              {key}
            </span>

            {/* Option content */}
            <div className="flex-1 min-w-0 pt-0.5">
              {text ? (
                <div className={cn(
                  "text-sm leading-relaxed transition-colors duration-200 sb-protected",
                  isSelected ? "text-white" : "text-white/60 group-hover:text-white/80",
                )}>
                  <MathMarkdown content={text} variant="option" />
                </div>
              ) : null}

              {imageUrl ? (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt={`Option ${key}`}
                    className="max-h-40 rounded-lg border border-white/[0.06] object-contain sb-protected-img"
                    loading="lazy"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </div>
              ) : null}
            </div>

            {/* Selection indicator */}
            {isSelected ? (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sb-accent)] text-white shadow-sm mt-1 animate-in zoom-in-50 fade-in duration-200">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
