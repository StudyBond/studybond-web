"use client";

import { useStudyStore, type OptionKey } from "@/features/study/stores/study-store";
import { StudyOptionGrid } from "./study-option-grid";
import { MathMarkdown } from "@/components/ui/math-markdown";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, ArrowRight, ArrowLeft, Crown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type StudyQuestionCardProps = {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onEndSession?: () => void;
};

export function StudyQuestionCard({ question, questionIndex, totalQuestions, onEndSession }: StudyQuestionCardProps) {
  const state = useStudyStore((s) => s.questionStates[question.id]);
  const selectOption = useStudyStore((s) => s.selectOption);
  const checkAnswer = useStudyStore((s) => s.checkAnswer);
  const showAnswer = useStudyStore((s) => s.showAnswer);
  const skipQuestion = useStudyStore((s) => s.skipQuestion);
  const nextQuestion = useStudyStore((s) => s.nextQuestion);
  const prevQuestion = useStudyStore((s) => s.prevQuestion);
  const currentIndex = useStudyStore((s) => s.currentIndex);
  const isPremiumSession = useStudyStore((s) => s.isPremiumSession);

  const selectedAnswer = state?.selectedAnswer ?? null;
  const phase = state?.phase ?? "attempt";
  const isRevealed = phase === "revealed" || phase === "skipped";
  const isLastQuestion = currentIndex === totalQuestions - 1;

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
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--sb-bg-surface-1)] p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        <div>
          {/* Question Text */}
          <h2 className="text-sm sm:text-base md:text-lg font-medium leading-relaxed text-white/90 sb-protected">
            <MathMarkdown content={question.questionText} variant="question" />
          </h2>

          {/* Question image */}
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="mt-4 max-h-56 sm:max-h-72 rounded-xl border border-white/[0.06] object-contain sb-protected-img"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
          {/* Left: Previous & secondary actions */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="text-white/40 hover:text-white/80 hover:bg-white/[0.04] text-xs h-9 px-2.5"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Previous
            </Button>

            {phase === "attempt" && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showAnswer(question.id)}
                  className="text-white/40 hover:text-white/80 hover:bg-white/[0.04] text-xs h-9 px-2.5"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Show Answer</span>
                  <span className="xs:hidden">Answer</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipQuestion(question.id)}
                  className="text-white/40 hover:text-white/80 hover:bg-white/[0.04] text-xs h-9 px-2.5"
                >
                  Skip
                </Button>
              </div>
            )}
          </div>

          {/* Right/Bottom Primary CTA */}
          <div className="w-full sm:w-auto">
            {phase === "attempt" ? (
              <Button
                onClick={() => checkAnswer(question.id)}
                disabled={!selectedAnswer}
                className="w-full sm:w-auto bg-[var(--sb-study-accent)] hover:bg-[var(--sb-study-accent)]/80 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[var(--sb-study-glow)] h-10 px-5 rounded-xl"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Check Answer
              </Button>
            ) : isLastQuestion ? (
              <Button
                onClick={() => onEndSession?.()}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold h-10 px-5 rounded-xl"
              >
                Finish Session
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold h-10 px-5 rounded-xl"
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

            {!isPremiumSession && (
              <div className="mt-4 pt-3.5 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-500/[0.06] -mx-5 -mb-5 md:-mx-6 md:-mb-6 p-4 rounded-b-2xl">
                <div className="flex items-center gap-2.5 text-xs text-amber-200">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-black font-bold">
                    <Crown className="h-4 w-4 fill-black" />
                  </div>
                  <span>Want 2,000+ real past questions on <strong>{question.subject}</strong>?</span>
                </div>
                <a
                  href="/dashboard/settings?tab=subscription"
                  className="shrink-0 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-amber-500/30 transition-all"
                >
                  <span>Unlock Real Bank</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
