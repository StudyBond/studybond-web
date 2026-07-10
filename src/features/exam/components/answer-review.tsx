"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Check, X as XIcon, Lightbulb, Info, Flag } from "lucide-react";
import { MathMarkdown } from "@/components/ui/math-markdown";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { ExamResult, QuestionWithAnswer } from "@/lib/api/types";
import { ReportQuestionModal } from "@/features/exam/components/report-question-modal";

type AnswerReviewProps = {
  result: ExamResult;
};

// ── Media Helper ──────────────────────────────────────────

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg)$/i.test(url.split("?")[0]);
}

function MediaNode({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  if (isVideoUrl(url)) {
    return (
      <video
        src={url}
        className={cn(className, "sb-protected-img")}
        controls
        preload="metadata"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className={cn(className, "sb-protected-img")}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
    />
  );
}

// Extracted Option view to display correct/incorrect options cleanly
function OptionView({
  label,
  text,
  imageUrl,
  isCorrect,
  isSelected,
}: {
  label: string;
  text: string | null;
  imageUrl: string | null;
  isCorrect: boolean;
  isSelected: boolean;
}) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!text && !imageUrl) return null;

  // Determine styling based on state
  let styleClass = "border-white/[0.06] bg-white/[0.02] text-white/50";
  let icon = null;

  if (isCorrect) {
    styleClass = "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";
    icon = (
      <Check className="h-4 w-4 shrink-0 transition-transform duration-300" />
    );
  } else if (isSelected && !isCorrect) {
    styleClass = "border-red-400/30 bg-red-400/10 text-red-400";
    icon = (
      <XIcon className="h-4 w-4 shrink-0 transition-transform duration-300" />
    );
  } else {
    // Non-selected wrong option - keep it subtle
    styleClass = "border-white/[0.04] bg-[var(--sb-bg)] text-white/40";
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors sm:gap-3 sm:rounded-xl md:p-4",
        styleClass,
      )}
    >
      {/* Option Key */}
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded bg-black/20 text-xs font-bold",
          isCorrect
            ? "bg-emerald-400/20"
            : isSelected
              ? "bg-red-400/20"
              : "bg-white/[0.05]",
        )}
      >
        {label}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        {text ? (
          <div className="mb-2 leading-relaxed">
            <MathMarkdown content={text} />
          </div>
        ) : null}
        {imageUrl ? (
          <button
            type="button"
            onClick={() => setLightboxSrc(imageUrl)}
            className="block cursor-pointer transition-opacity hover:opacity-80"
          >
            <MediaNode
              url={imageUrl}
              alt={`Option ${label}`}
              className="max-h-32 rounded border border-white/10 opacity-80 mix-blend-screen"
            />
          </button>
        ) : null}
      </div>

      {/* Icon Indicator */}
      {icon}

      {/* Lightbox */}
      <ImageLightbox src={lightboxSrc} alt={`Option ${label}`} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}

export function QuestionReviewItem({
  q,
  index,
}: {
  q: QuestionWithAnswer;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const options: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--sb-bg-surface-1)] transition-all duration-300 sm:rounded-2xl">
      {/* Question Header (Always visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-white/[0.02] focus:outline-none sm:gap-4 sm:p-5 md:p-6"
      >
        {/* Status Indicator */}
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border sm:h-8 sm:w-8",
            q.isCorrect
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
              : q.userAnswer
                ? "border-red-400/30 bg-red-400/10 text-red-400"
                : "border-white/[0.06] bg-white/[0.03] text-white/30",
          )}
        >
          {q.isCorrect ? (
            <Check className="h-4 w-4" />
          ) : q.userAnswer ? (
            <XIcon className="h-4 w-4" />
          ) : (
            <span className="text-[10px] font-bold">—</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
              Question {index + 1}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sb-accent)]">
              {q.subject}
            </span>
          </div>
          <div className={cn("text-sm md:text-base font-medium text-white/80 sb-protected", !expanded && "line-clamp-2")}>
            <MathMarkdown content={q.questionText} variant="question" />
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-white/20 transition-transform duration-300",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Expanded Content */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-white/[0.06] p-3.5 sm:space-y-6 sm:p-5 md:p-6">
            {/* Full Question Text/Images if expanded */}
            <div className="space-y-4">
              {q.parentQuestionText && (
                <div className="rounded-xl bg-white/[0.02] p-3.5 text-xs text-white/50 italic border-l-2 border-white/10 sb-protected sm:p-4">
                  <MathMarkdown content={q.parentQuestionText} />
                </div>
              )}
              {q.imageUrl && (
                <button
                  type="button"
                  onClick={() => setLightboxSrc(q.imageUrl!)}
                  className="block cursor-pointer transition-opacity hover:opacity-80"
                >
                  <MediaNode
                    url={q.imageUrl}
                    alt="Question"
                    className="max-h-48 rounded-xl border border-white/[0.06]"
                  />
                </button>
              )}
            </div>

            {/* Options Grid */}
            <div className="space-y-3">
              {options.map((opt) => (
                <OptionView
                  key={opt}
                  label={opt}
                  text={
                    q[`option${opt}` as keyof QuestionWithAnswer] as
                      | string
                      | null
                  }
                  imageUrl={
                    q[`option${opt}ImageUrl` as keyof QuestionWithAnswer] as
                      | string
                      | null
                  }
                  isCorrect={q.correctAnswer === opt}
                  isSelected={q.userAnswer === opt}
                />
              ))}
            </div>

            {/* Explanation / Notes */}
            {q.explanation && (
              <div className="rounded-lg border border-[var(--sb-accent)]/20 bg-gradient-to-br from-[var(--sb-accent)]/10 to-transparent p-3.5 shadow-[0_0_15px_var(--sb-accent-glow)] sm:rounded-xl sm:p-4 md:p-5">
                <div className="mb-2 flex items-center gap-2 text-[var(--sb-accent)]">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Explanation
                  </span>
                </div>
                <div className="min-w-0 text-sm leading-relaxed text-white/70 sb-protected">
                  <MathMarkdown
                    content={q.explanation.text}
                    variant="explanation"
                  />
                </div>
                {q.explanation.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setLightboxSrc(q.explanation!.imageUrl!)}
                    className="block cursor-pointer transition-opacity hover:opacity-80 mt-3"
                  >
                    <MediaNode
                      url={q.explanation.imageUrl}
                      alt="Explanation"
                      className="max-h-40 rounded-lg border border-white/10"
                    />
                  </button>
                )}
              </div>
            )}

            {/* Additional Notes (Expert/Pro Tip styling) */}
            {q.explanation?.additionalNotes && (
              <div className="mt-4 rounded-lg border border-blue-400/20 bg-gradient-to-br from-blue-400/10 to-transparent p-3.5 shadow-[0_0_15px_rgba(96,165,250,0.05)] sm:rounded-xl sm:p-4 md:p-5">
                <div className="mb-2 flex items-center gap-2 text-blue-400">
                  <Info className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Expert Note
                  </span>
                </div>
                <div className="min-w-0 text-sm leading-relaxed text-white/70 sb-protected">
                  <MathMarkdown content={q.explanation.additionalNotes} />
                </div>
              </div>
            )}

            {/* Footer: time spent + report */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-white/15 transition-all hover:bg-white/[0.03] hover:text-amber-400/60"
              >
                <Flag className="h-3 w-3" />
                Report
              </button>
              {q.timeSpentSeconds !== null && (
                <div className="sb-mono text-[10px] text-white/20">
                  Time spent: {q.timeSpentSeconds}s
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report modal */}
      <ReportQuestionModal
        questionId={q.id}
        questionNumber={index + 1}
        subject={q.subject}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      {/* Image lightbox */}
      <ImageLightbox src={lightboxSrc} alt="Full size image" onClose={() => setLightboxSrc(null)} />
    </div>
  );
}

export function AnswerReview({ result }: AnswerReviewProps) {
  // Option to filter
  const [filter, setFilter] = useState<"all" | "incorrect">("all");

  const filteredQuestions = result.questions.filter((q) => {
    if (filter === "incorrect") return !q.isCorrect;
    return true;
  });

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Answer Review
        </h3>
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              filter === "all"
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-white/40 hover:text-white/70",
            )}
          >
            All Questions
          </button>
          <button
            onClick={() => setFilter("incorrect")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              filter === "incorrect"
                ? "bg-red-500/20 text-red-300 shadow-sm"
                : "text-white/40 hover:text-white/70",
            )}
          >
            Incorrect Only
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center">
            <Check className="h-8 w-8 text-emerald-400 mx-auto mb-3 opacity-50" />
            <p className="text-white/50 text-sm">
              No incorrect answers. Perfect score!
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, i) => (
            <QuestionReviewItem
              key={q.id}
              q={q}
              index={result.questions.indexOf(q)}
            />
          ))
        )}
      </div>
    </div>
  );
}
