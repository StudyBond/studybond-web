"use client";

import { cn } from "@/lib/utils/cn";
import { useExamStore, type SubjectRange } from "@/features/exam/stores/exam-store";
import { X, Bookmark, Filter } from "lucide-react";
import { useState } from "react";

type QuestionNavigatorProps = {
  questionIds: number[];
};

type FilterMode = "all" | "unanswered" | "flagged";

export function QuestionNavigator({ questionIds }: QuestionNavigatorProps) {
  const currentIndex = useExamStore((s) => s.currentIndex);
  const questionStates = useExamStore((s) => s.questionStates);
  const goToQuestion = useExamStore((s) => s.goToQuestion);
  const goToSubject = useExamStore((s) => s.goToSubject);
  const setNavigatorOpen = useExamStore((s) => s.setNavigatorOpen);
  const getAnsweredCount = useExamStore((s) => s.getAnsweredCount);
  const getFlaggedCount = useExamStore((s) => s.getFlaggedCount);
  const getUnansweredCount = useExamStore((s) => s.getUnansweredCount);
  const subjectRanges = useExamStore((s) => s.subjectRanges);

  const [filter, setFilter] = useState<FilterMode>("all");

  const answered = getAnsweredCount();
  const flagged = getFlaggedCount();
  const unanswered = getUnansweredCount();

  // Determine current subject from currentIndex
  const currentSubject = subjectRanges.find(
    (r) => currentIndex >= r.startIndex && currentIndex <= r.endIndex
  )?.subject ?? null;

  function handleSelect(index: number) {
    goToQuestion(index);
    // Close on mobile
    if (window.innerWidth < 768) {
      setNavigatorOpen(false);
    }
  }

  function handleSubjectClick(subject: string) {
    goToSubject(subject);
    // Close on mobile
    if (window.innerWidth < 768) {
      setNavigatorOpen(false);
    }
  }

  function getSubjectProgress(range: SubjectRange) {
    let answeredInSubject = 0;
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      const qId = questionIds[i];
      const state = questionStates.get(qId);
      if (state?.answer !== null) answeredInSubject++;
    }
    return answeredInSubject;
  }

  const filteredIndices = questionIds
    .map((qId, i) => ({ qId, index: i }))
    .filter(({ qId }) => {
      const state = questionStates.get(qId);
      if (!state) return true;
      if (filter === "unanswered") return state.answer === null;
      if (filter === "flagged") return state.flagged;
      return true;
    });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">
          Questions
        </h3>
        <button
          onClick={() => setNavigatorOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 hover:bg-white/[0.05] hover:text-white/40 transition-colors md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Subject tabs */}
      {subjectRanges.length > 1 ? (
        <div className="border-b border-white/[0.06] px-2 py-2">
          <div className="flex gap-1 overflow-x-auto sb-scroll-hide">
            {subjectRanges.map((range) => {
              const isActive = currentSubject === range.subject;
              const subjectAnswered = getSubjectProgress(range);
              const isComplete = subjectAnswered === range.count;

              return (
                <button
                  key={`${range.subject}-${range.startIndex}`}
                  onClick={() => handleSubjectClick(range.subject)}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                    isActive
                      ? "bg-[var(--sb-accent)]/[0.12] border border-[var(--sb-accent)]/30 shadow-[0_0_12px_var(--sb-accent-glow)]"
                      : "border border-transparent hover:bg-white/[0.04]",
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                    isActive ? "text-[var(--sb-accent)]" : "text-white/40",
                  )}>
                    {range.subject}
                  </span>
                  {/* Mini progress bar */}
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-10 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isComplete ? "bg-emerald-400" : "bg-[var(--sb-accent)]/60",
                        )}
                        style={{ width: `${(subjectAnswered / range.count) * 100}%` }}
                      />
                    </div>
                    <span className={cn(
                      "sb-mono text-[8px] font-bold",
                      isComplete ? "text-emerald-400/70" : "text-white/20",
                    )}>
                      {subjectAnswered}/{range.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-1 border-b border-white/[0.06] px-3 py-2.5">
        <div className="flex flex-col items-center gap-0.5">
          <span className="sb-mono text-sm font-bold text-emerald-400">{answered}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/15">Answered</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="sb-mono text-sm font-bold text-white/40">{unanswered}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/15">Remaining</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="sb-mono text-sm font-bold text-[var(--sb-accent)]">{flagged}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/15">Flagged</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] px-3 py-2">
        {([
          { key: "all", label: "All", count: questionIds.length },
          { key: "unanswered", label: "Remaining", count: unanswered },
          { key: "flagged", label: "Flagged", count: flagged },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all duration-200",
              filter === tab.key
                ? "bg-white/[0.06] text-white/70"
                : "text-white/20 hover:text-white/40",
            )}
          >
            {tab.key === "flagged" ? <Bookmark className="h-2.5 w-2.5" /> : null}
            {tab.key === "unanswered" ? <Filter className="h-2.5 w-2.5" /> : null}
            {tab.label}
            <span className="sb-mono text-[9px] text-white/20">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Question grid — grouped by subject */}
      <div className="flex-1 overflow-y-auto px-3 py-3 sb-scroll-hide">
        {subjectRanges.length > 1 ? (
          // Multi-subject: show grouped with subject headers
          <div className="space-y-4">
            {subjectRanges.map((range) => {
              const rangeQuestions = filteredIndices.filter(
                ({ index }) => index >= range.startIndex && index <= range.endIndex
              );

              if (rangeQuestions.length === 0) return null;

              return (
                <div key={range.subject}>
                  {/* Subject header */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      {range.subject}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {rangeQuestions.map(({ qId, index }) => {
                      const state = questionStates.get(qId);
                      const isActive = index === currentIndex;
                      const isAnswered = state?.answer !== null;
                      const isFlagged = state?.flagged ?? false;
                      const subjectIndex = index - range.startIndex + 1;

                      return (
                        <button
                          key={qId}
                          onClick={() => handleSelect(index)}
                          className={cn(
                            "relative flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200",
                            isActive
                              ? "bg-[var(--sb-accent)] text-white shadow-[0_0_16px_var(--sb-accent-glow)] scale-105"
                              : isAnswered
                                ? "bg-emerald-400/[0.1] border border-emerald-400/20 text-emerald-400/80 hover:bg-emerald-400/[0.15]"
                                : "bg-white/[0.03] border border-white/[0.06] text-white/30 hover:bg-white/[0.06] hover:text-white/50",
                          )}
                        >
                          {subjectIndex}

                          {/* Flagged dot indicator */}
                          {isFlagged && !isActive ? (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--sb-accent)] shadow-[0_0_6px_var(--sb-accent-glow)]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Single-subject: flat grid (original behavior)
          <div className="grid grid-cols-5 gap-1.5">
            {filteredIndices.map(({ qId, index }) => {
              const state = questionStates.get(qId);
              const isActive = index === currentIndex;
              const isAnswered = state?.answer !== null;
              const isFlagged = state?.flagged ?? false;

              return (
                <button
                  key={qId}
                  onClick={() => handleSelect(index)}
                  className={cn(
                    "relative flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-[var(--sb-accent)] text-white shadow-[0_0_16px_var(--sb-accent-glow)] scale-105"
                      : isAnswered
                        ? "bg-emerald-400/[0.1] border border-emerald-400/20 text-emerald-400/80 hover:bg-emerald-400/[0.15]"
                        : "bg-white/[0.03] border border-white/[0.06] text-white/30 hover:bg-white/[0.06] hover:text-white/50",
                  )}
                >
                  {index + 1}

                  {/* Flagged dot indicator */}
                  {isFlagged && !isActive ? (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--sb-accent)] shadow-[0_0_6px_var(--sb-accent-glow)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {filteredIndices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-white/20">
              {filter === "flagged" ? "No flagged questions" : "All questions answered"}
            </p>
          </div>
        ) : null}
      </div>

      {/* Legend */}
      <div className="border-t border-white/[0.06] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-3 text-[9px] text-white/15">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[var(--sb-accent)]" /> Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded border border-emerald-400/30 bg-emerald-400/10" /> Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded border border-white/[0.06] bg-white/[0.03]" /> Unanswered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative h-2.5 w-2.5 rounded bg-white/[0.03]">
              <span className="absolute -top-px -right-px h-1.5 w-1.5 rounded-full bg-[var(--sb-accent)]" />
            </span>
            Flagged
          </span>
        </div>
      </div>
    </div>
  );
}
