"use client";

import { useStudyStore } from "@/features/study/stores/study-store";
import { Flame, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudyHeaderProps = {
  onEndSession: () => void;
};

export function StudyHeader({ onEndSession }: StudyHeaderProps) {
  const currentIndex = useStudyStore((s) => s.currentIndex);
  const questions = useStudyStore((s) => s.questions);
  const mastery = useStudyStore((s) => s.mastery);
  
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  
  // Calculate completed (either revealed, correct or incorrect first attempt)
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
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[var(--sb-bg)]/80 backdrop-blur-md py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Progress and Subject info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sb-study-accent)]">
              {currentQuestion?.subject || "Study Session"}
            </span>
            <span className="text-white/20 text-xs">•</span>
            <span className="text-xs text-white/40 truncate">
              {currentQuestion?.topic || "General Topic"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-white/90">
              {completed} of {total} studied
            </div>
            {/* Progress bar */}
            <div className="w-28 md:w-40 h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--sb-study-accent)] to-indigo-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center/Right: Mastery Stats */}
        <div className="flex items-center gap-4">
          {/* Streak indicator */}
          {mastery.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 animate-[pulse_1.5s_infinite_ease-in-out]">
              <Flame className="h-4 w-4 fill-orange-400 animate-bounce" />
              <span className="text-xs font-bold font-mono">{mastery.currentStreak} Streak</span>
            </div>
          )}

          {/* Mastery % */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sb-study-accent)]/10 border border-[var(--sb-study-accent)]/20 text-[var(--sb-study-accent)]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold font-mono">{masteryPercent}% Mastery</span>
          </div>

          {/* End session CTA */}
          <Button
            variant="ghost"
            onClick={onEndSession}
            className="text-white/40 hover:text-white/80 hover:bg-white/[0.04] p-2 h-9 rounded-xl"
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">End Session</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
