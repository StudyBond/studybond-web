"use client";

import { useStudyStore } from "@/features/study/stores/study-store";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, ChevronRight, Check, X, Eye, Circle, Layers } from "lucide-react";
import { useState } from "react";

type StudyTopicDrawerProps = {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
};

export function StudyTopicDrawer({ isOpenMobile, onCloseMobile }: StudyTopicDrawerProps) {
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

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--sb-study-accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">
            Topics & Questions
          </span>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
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
                  "flex w-full items-center justify-between p-2.5 rounded-xl text-left transition-all",
                  isCurrentGroup 
                    ? "bg-white/[0.06] text-white border border-white/10" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.02] border border-transparent"
                )}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs font-semibold truncate leading-tight mb-0.5">
                    {group.topic}
                  </p>
                  {group.subtopics && group.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {group.subtopics.slice(0, 2).map((sub, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.05] text-white/40 truncate max-w-[120px]">
                          {sub}
                        </span>
                      ))}
                      {group.subtopics.length > 2 && (
                        <span className="text-[9px] text-white/30">+{group.subtopics.length - 2}</span>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-white/40 font-mono">
                    {group.completedCount}/{group.questionIndices.length} done ({percent}%)
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  )}
                </div>
              </button>

              {/* Collapsible list of questions */}
              {isExpanded && (
                <div className="pl-3 space-y-1 border-l border-white/[0.06] ml-3.5 mt-1">
                  {group.questionIndices.map((globalIndex) => {
                    const q = questions[globalIndex];
                    const isCurrent = currentIndex === globalIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          goToQuestion(globalIndex);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 py-2 px-2.5 rounded-lg text-left text-xs transition-all",
                          isCurrent
                            ? "bg-[var(--sb-study-accent)]/15 text-[var(--sb-study-accent)] font-semibold border border-[var(--sb-study-accent)]/30"
                            : "text-white/50 hover:text-white hover:bg-white/[0.03]"
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:block border-r border-white/[0.06] pr-4 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-full max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--sb-bg-surface-1)] p-5 space-y-4 shadow-2xl">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />
            {content}
          </div>
        </div>
      )}
    </>
  );
}
