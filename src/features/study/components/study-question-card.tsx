"use client";

import { useStudyStore, type OptionKey } from "@/features/study/stores/study-store";
import { StudyOptionGrid } from "./study-option-grid";
import { MathMarkdown } from "@/components/ui/math-markdown";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type StudyQuestionCardProps = {
  question: any;
  questionIndex: number;
  totalQuestions: number;
};

export function StudyQuestionCard({ question, questionIndex, totalQuestions }: StudyQuestionCardProps) {
  const state = useStudyStore((s) => s.questionStates[question.id]);
  const selectOption = useStudyStore((s) => s.selectOption);
  const checkAnswer = useStudyStore((s) => s.checkAnswer);
  const showAnswer = useStudyStore((s) => s.showAnswer);
  const skipQuestion = useStudyStore((s) => s.skipQuestion);
  const nextQuestion = useStudyStore((s) => s.nextQuestion);
  const prevQuestion = useStudyStore((s) => s.prevQuestion);
  const currentIndex = useStudyStore((s) => s.currentIndex);

  const selectedAnswer = state?.selectedAnswer ?? null;
  const phase = state?.phase ?? "attempt";
  const isRevealed = phase === "revealed" || phase === "skipped";

  function handleSelectOption(key: OptionKey) {
    if (isRevealed) return;
    selectOption(question.id, key);
  }

  return (
    <div className="space-y-6">
      {/* Comprehension passage */}
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

      {/* Main question card */}
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--sb-bg-surface-1)] p-6 md:p-8 space-y-6">
        <div>
          {/* Question Text */}
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

        {/* Options */}
        <StudyOptionGrid
          question={question}
          selectedAnswer={selectedAnswer}
          correctAnswer={question.correctAnswer}
          phase={phase}
          onSelect={handleSelectOption}
          disabled={isRevealed}
        />

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
          {/* Left: Previous Navigation */}
          <Button
            variant="ghost"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {phase === "attempt" ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => showAnswer(question.id)}
                  className="text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Show Answer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => skipQuestion(question.id)}
                  className="text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                >
                  Skip
                </Button>
                <Button
                  onClick={() => checkAnswer(question.id)}
                  disabled={!selectedAnswer}
                  className="bg-[var(--sb-study-accent)] hover:bg-[var(--sb-study-accent)]/80 text-white font-semibold shadow-lg shadow-[var(--sb-study-glow)]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Check Answer
                </Button>
              </>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={currentIndex === totalQuestions - 1}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Next Question
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Explanation slide-in */}
      <AnimatePresence>
        {isRevealed && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5 md:p-6 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.03)]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-bold text-emerald-400">Explanation</h3>
            </div>

            <div className="text-sm leading-relaxed text-white/70">
              <MathMarkdown content={question.explanation.text} />
            </div>

            {question.explanation.imageUrl && (
              <img
                src={question.explanation.imageUrl}
                alt="Explanation illustration"
                className="max-h-60 rounded-xl border border-white/[0.06] object-contain"
                loading="lazy"
              />
            )}

            {question.explanation.additionalNotes && (
              <div className="pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">
                  Additional Notes
                </p>
                <p className="text-xs text-white/50 leading-relaxed">
                  {question.explanation.additionalNotes}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
