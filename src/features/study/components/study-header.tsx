"use client";

import { useStudyStore } from "@/features/study/stores/study-store";
import { Flame, Sparkles, LogOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudyHeaderProps = {
  onEndSession: () => void;
  onOpenMobileTopics?: () => void;
};

export function StudyHeader({ onEndSession, onOpenMobileTopics }: StudyHeaderProps) {
  const currentIndex = useStudyStore((s) => s.currentIndex);
  const questions = useStudyStore((s) => s.questions);
  const mastery = useStudyStore((s) => s.mastery);
  
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  
  // Calculate completed
  const completed = useStudyStore((s) => {
    return Object.values(s.questionStates).filter(
      (state) => state.phase !== "attempt"
    ).length;
  });

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;
  
  // Mastery is correct first attempts over total completed
  const totalAnswered = mastery.correct + mastery.wrong;
  const masteryPercent = totalAnswered > 0 ? Math.round((mastery.correct / totalAnswered) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[var(--sb-bg)]/90 backdrop-blur-md py-3.5 px-1 sm:px-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Top / Left: Subject info & mobile topics trigger */}
        <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sb-study-accent)] truncate">
                {currentQuestion?.subject || "Study Session"}
              </span>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-xs text-white/40 truncate">
                {currentQuestion?.topic || "General Topic"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm font-semibold text-white/90 whitespace-nowrap">
                {completed}/{total} studied
              </span>
              <div className="w-20 sm:w-32 md:w-40 h-2 bg-white/[0.04] rounded-full overflow-hidden shrink-0">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--sb-study-accent)] to-indigo-400 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mobile topics button */}
          {onOpenMobileTopics && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenMobileTopics}
              className="lg:hidden shrink-0 border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/10 text-xs h-8 px-2.5 rounded-lg flex items-center gap-1.5"
            >
              <Layers className="h-3.5 w-3.5 text-[var(--sb-study-accent)]" />
              <span>Topics</span>
            </Button>
          )}
        </div>

        {/* Center/Right: Mastery Stats & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
          <div className="flex items-center gap-2">
            {/* Streak indicator */}
            {mastery.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold font-mono">
                <Flame className="h-3.5 w-3.5 fill-orange-400" />
                <span>{mastery.currentStreak}d</span>
              </div>
            )}

            {/* Mastery % */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--sb-study-accent)]/10 border border-[var(--sb-study-accent)]/20 text-[var(--sb-study-accent)] text-xs font-bold font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{masteryPercent}%</span>
            </div>
          </div>

          {/* End session CTA */}
          <Button
            variant="ghost"
            onClick={onEndSession}
            className="text-white/40 hover:text-white/80 hover:bg-white/[0.04] p-1.5 h-8 sm:h-9 rounded-lg sm:rounded-xl text-xs"
          >
            <LogOut className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
