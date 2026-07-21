"use client";

import { cn } from "@/lib/utils/cn";
import { Check, X } from "lucide-react";
import type { OptionKey } from "@/features/study/stores/study-store";
import { MathMarkdown } from "@/components/ui/math-markdown";

type StudyOptionGridProps = {
  question: any;
  selectedAnswer: OptionKey | null;
  correctAnswer: string;
  phase: "attempt" | "revealed" | "skipped";
  onSelect: (key: OptionKey) => void;
  disabled?: boolean;
};

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D", "E"];

function getOptionText(question: any, key: OptionKey): string | null {
  const map: Record<OptionKey, string | null> = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
    E: question.optionE,
  };
  return map[key];
}

function getOptionImageUrl(question: any, key: OptionKey): string | null {
  const map: Record<OptionKey, string | null> = {
    A: question.optionAImageUrl,
    B: question.optionBImageUrl,
    C: question.optionCImageUrl,
    D: question.optionDImageUrl,
    E: question.optionEImageUrl,
  };
  return map[key];
}

export function StudyOptionGrid({
  question,
  selectedAnswer,
  correctAnswer,
  phase,
  onSelect,
  disabled = false,
}: StudyOptionGridProps) {
  const isRevealed = phase === "revealed" || phase === "skipped";

  return (
    <div className="space-y-2.5">
      {OPTION_KEYS.map((key) => {
        const text = getOptionText(question, key);
        const imageUrl = getOptionImageUrl(question, key);

        if (!text && !imageUrl) return null;

        const isSelected = selectedAnswer === key;
        const isCorrect = key === correctAnswer;
        const isWrongAndSelected = isSelected && !isCorrect;

        // Visual states in reveal mode
        let buttonClass = "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]";
        let badgeClass = "bg-white/[0.05] text-white/40 group-hover:bg-white/[0.08] group-hover:text-white/60";
        let textClass = "text-white/60 group-hover:text-white/80";
        let badgeContent: React.ReactNode = key;

        if (isRevealed) {
          if (isCorrect) {
            buttonClass = "border-emerald-500/40 bg-emerald-500/[0.08] shadow-[0_0_24px_rgba(16,185,129,0.15)] scale-[1.01]";
            badgeClass = "bg-emerald-500 text-white animate-[bounce_0.5s_ease-in-out]";
            badgeContent = <Check className="h-4 w-4 stroke-[3]" />;
            textClass = "text-emerald-200 font-medium";
          } else if (isWrongAndSelected) {
            buttonClass = "border-rose-500/40 bg-rose-500/[0.08] shadow-[0_0_24px_rgba(244,63,94,0.15)]";
            badgeClass = "bg-rose-500 text-white";
            badgeContent = <X className="h-4 w-4 stroke-[3]" />;
            textClass = "text-rose-200";
          } else {
            buttonClass = "border-white/[0.03] bg-white/[0.005] opacity-35";
            badgeClass = "bg-white/[0.02] text-white/20";
            textClass = "text-white/30";
          }
        } else if (isSelected) {
          buttonClass = "border-[var(--sb-study-accent)] bg-[var(--sb-study-accent)]/[0.08] shadow-[0_0_24px_var(--sb-study-glow)]";
          badgeClass = "bg-[var(--sb-study-accent)] text-white shadow-md";
          textClass = "text-white";
        }

        return (
          <button
            key={key}
            onClick={() => !isRevealed && onSelect(key)}
            disabled={disabled || isRevealed}
            className={cn(
              "group relative w-full rounded-2xl border p-4 text-left transition-all duration-300",
              "flex items-start gap-3.5",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-study-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sb-bg)]",
              buttonClass
            )}
          >
            {/* Option letter/icon badge */}
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300",
                badgeClass
              )}
            >
              {badgeContent}
            </span>

            {/* Option content */}
            <div className="flex-1 min-w-0 pt-0.5">
              {text ? (
                <div className={cn(
                  "text-sm leading-relaxed transition-colors duration-200 sb-protected",
                  textClass
                )}>
                  <MathMarkdown content={text} variant="option" />
                </div>
              ) : null}

              {imageUrl ? (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt={`Option ${key}`}
                    className={cn(
                      "max-h-40 rounded-lg border border-white/[0.06] object-contain sb-protected-img transition-opacity duration-300",
                      isRevealed && !isCorrect && !isWrongAndSelected && "opacity-40"
                    )}
                    loading="lazy"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </div>
              ) : null}
            </div>

            {/* Pulsing indicator for correct option in reveal mode */}
            {isRevealed && isCorrect && (
              <span className="absolute inset-0 rounded-2xl border border-emerald-500/30 animate-pulse pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
