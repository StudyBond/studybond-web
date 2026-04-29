"use client";

import { cn } from "@/lib/utils/cn";
import { Bookmark } from "lucide-react";
import { OptionGrid } from "@/features/exam/components/option-grid";
import { useExamStore, type OptionKey } from "@/features/exam/stores/exam-store";
import { MathMarkdown } from "@/components/ui/math-markdown";
import type { ExamQuestion } from "@/lib/api/types";

type QuestionCardProps = {
  question: ExamQuestion;
  questionIndex: number;
  totalQuestions: number;
};

export function QuestionCard({ question, questionIndex, totalQuestions }: QuestionCardProps) {
  const questionState = useExamStore((s) => s.questionStates.get(question.id));
  const setAnswer = useExamStore((s) => s.setAnswer);
  const toggleFlag = useExamStore((s) => s.toggleFlag);
  const subjectRanges = useExamStore((s) => s.subjectRanges);

  const selectedAnswer = questionState?.answer ?? null;
  const isFlagged = questionState?.flagged ?? false;

  // Per-subject numbering
  const subjectRange = subjectRanges.find(
    (r) => questionIndex >= r.startIndex && questionIndex <= r.endIndex
  );
  const subjectQuestionNumber = subjectRange
    ? questionIndex - subjectRange.startIndex + 1
    : questionIndex + 1;
  const subjectQuestionTotal = subjectRange?.count ?? totalQuestions;

  function handleSelectOption(key: OptionKey) {
    // Toggle off if re-clicking the same option
    if (selectedAnswer === key) {
      setAnswer(question.id, null);
    } else {
      setAnswer(question.id, key);
    }
  }

  return (
    <div className="sb-enter space-y-6">
      {/* Comprehension passage (if this question belongs to a passage group) */}
      {question.parentQuestionText ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 sb-protected">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-3">
            Read the passage below
          </p>
          <div className="text-sm leading-[1.8] text-white/70">
            <MathMarkdown content={question.parentQuestionText} />
          </div>
          {question.parentQuestionImageUrl ? (
            <img
              src={question.parentQuestionImageUrl}
              alt="Passage illustration"
              className="mt-4 max-h-64 rounded-xl border border-white/[0.06] object-contain sb-protected-img"
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          ) : null}
        </div>
      ) : null}

      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Subject + question number */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
              {question.subject}
            </span>
            <span className="text-[10px] font-semibold text-white/15 uppercase tracking-wider">
              Q{subjectQuestionNumber} of {subjectQuestionTotal}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-base md:text-lg font-medium leading-relaxed text-white/90 sb-protected">
            <MathMarkdown content={question.questionText} variant="question" />
          </h2>

          {/* Question image */}
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="mt-4 max-h-72 rounded-xl border border-white/[0.06] object-contain sb-protected-img"
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          ) : null}
        </div>

        {/* Bookmark/flag button */}
        <button
          onClick={() => toggleFlag(question.id)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
            isFlagged
              ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/10 text-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]"
              : "border-white/[0.06] bg-white/[0.02] text-white/20 hover:border-white/[0.12] hover:text-white/40",
          )}
          title={isFlagged ? "Remove flag" : "Flag for review"}
        >
          <Bookmark
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isFlagged && "fill-current scale-110",
            )}
          />
        </button>
      </div>

      {/* Options */}
      <OptionGrid
        question={question}
        selectedAnswer={selectedAnswer}
        onSelect={handleSelectOption}
      />
    </div>
  );
}
