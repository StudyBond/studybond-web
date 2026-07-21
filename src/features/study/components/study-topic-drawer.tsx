"use client";

import { useStudyStore } from "@/features/study/stores/study-store";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, ChevronRight, Check, X, Eye, Circle } from "lucide-react";
import { useState } from "react";

export function StudyTopicDrawer() {
  const questions = useStudyStore((s) => s.questions);
  const currentIndex = useStudyStore((s) => s.currentIndex);
  const goToQuestion = useStudyStore((s) => s.goToQuestion);
  const topicGroups = useStudyStore((s) => s.topicGroups);
  const questionStates = useStudyStore((s) => s.questionStates);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Expand the first group by default
    if (topicGroups.length > 0) {
      const firstKey = `${topicGroups[0].subject}:${topicGroups[0].topic}`;
      return { [firstKey]: true };
    }
    return {};
  });

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function getStatusIcon(qId: number) {
    const state = questionStates[qId];
    if (!state || state.phase === "attempt") {
      return <Circle className="h-3 w-3 text-white/20" />;
    }

    if (state.revealedWithoutAttempt) {
      return <Eye className="h-3.5 w-3.5 text-blue-400" />;
    }

    if (state.isCorrectFirstAttempt) {
      return <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />;
    }

    return <X className="h-3.5 w-3.5 text-rose-400 stroke-[3]" />;
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-white/[0.06] pr-4 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
      <div className="text-xs font-bold uppercase tracking-wider text-white/30 px-2">
        Topics in Session
      </div>

      <div className="space-y-3">
        {topicGroups.map((group) => {
          const groupKey = `${group.subject}:${group.topic}`;
          const isExpanded = expandedGroups[groupKey];
          const isCurrentGroup = group.questionIndices.includes(currentIndex);
          const percent = group.questionIndices.length > 0 
            ? Math.round((group.completedCount / group.questionIndices.length) * 100) 
            : 0;

          return (
            <div key={groupKey} className="space-y-1">
              {/* Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className={cn(
                  "flex w-full items-center justify-between p-2 rounded-xl text-left transition-all",
                  isCurrentGroup 
                    ? "bg-white/[0.04] text-white" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-none mb-1">
                    {group.topic}
                  </p>
                  <p className="text-[10px] text-white/30 font-mono">
                    {group.completedCount}/{group.questionIndices.length} complete ({percent}%)
                  </p>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-white/30" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  )}
                </div>
              </button>

              {/* Collapsible list of questions */}
              {isExpanded && (
                <div className="pl-4 space-y-0.5 border-l border-white/[0.04] ml-3 mt-1">
                  {group.questionIndices.map((globalIndex) => {
                    const q = questions[globalIndex];
                    const isCurrent = currentIndex === globalIndex;
                    const state = questionStates[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(globalIndex)}
                        className={cn(
                          "flex w-full items-center gap-2.5 py-1.5 px-2 rounded-lg text-left text-xs transition-all",
                          isCurrent
                            ? "bg-[var(--sb-study-accent)]/10 text-[var(--sb-study-accent)] font-semibold"
                            : "text-white/45 hover:text-white/80 hover:bg-white/[0.01]"
                        )}
                      >
                        {getStatusIcon(q.id)}
                        <span className="truncate flex-1">
                          Question {globalIndex + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
