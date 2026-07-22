"use client";

import { useStudyStore } from "@/features/study/stores/study-store";
import { Crown, Sparkles, BookOpen, Flame, Clock, RefreshCw, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudySummaryProps = {
  onRestart: () => void;
  onBackToDashboard: () => void;
};

export function StudySummary({ onRestart, onBackToDashboard }: StudySummaryProps) {
  const questions = useStudyStore((s) => s.questions);
  const mastery = useStudyStore((s) => s.mastery);
  const topicGroups = useStudyStore((s) => s.topicGroups);
  const isPremiumSession = useStudyStore((s) => s.isPremiumSession);
  
  const total = questions.length;
  const attempted = mastery.correct + mastery.wrong;
  const masteryPercent = attempted > 0 ? Math.round((mastery.correct / attempted) * 100) : 0;

  // Calculate total time spent
  const timeSpent = useStudyStore((s) => {
    return Object.values(s.questionStates).reduce(
      (sum, state) => sum + state.timeSpentSeconds, 
      0
    );
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sb-study-accent)]/10 text-[var(--sb-study-accent)] shadow-[0_0_24px_var(--sb-study-glow)] mb-2 animate-bounce">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Study Session Complete!
        </h1>
        <p className="text-sm text-white/40">
          Nice job! Here's a breakdown of your learning loop.
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Studied */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 sm:p-5 text-center space-y-1">
          <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-indigo-400 mx-auto" />
          <p className="text-xl sm:text-2xl font-bold text-white font-mono">{total}</p>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/30">Studied</p>
        </div>

        {/* First Try Correct */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 sm:p-5 text-center space-y-1">
          <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 mx-auto" />
          <p className="text-xl sm:text-2xl font-bold text-white font-mono">{masteryPercent}%</p>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/30">Mastery Rate</p>
        </div>

        {/* Best Streak */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 sm:p-5 text-center space-y-1">
          <Flame className="h-4 sm:h-5 w-4 sm:w-5 text-orange-400 mx-auto" />
          <p className="text-xl sm:text-2xl font-bold text-white font-mono">{mastery.bestStreak}</p>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/30">Best Streak</p>
        </div>

        {/* Time Spent */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 sm:p-5 text-center space-y-1">
          <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400 mx-auto" />
          <p className="text-xl sm:text-2xl font-bold text-white font-mono truncate px-1">
            {timeSpent > 60 ? `${Math.round(timeSpent / 60)}m` : `${timeSpent}s`}
          </p>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/30">Time Spent</p>
        </div>
      </div>

      {/* Subject and Topic Mastery Breakdown */}
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--sb-bg-surface-1)] p-4 sm:p-6 space-y-5 sm:space-y-6">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/40">
          Mastery by Topic
        </h3>

        <div className="space-y-4">
          {topicGroups.map((group) => {
            const completedCount = group.questionIndices.filter(
              (idx) => useStudyStore.getState().questionStates[questions[idx].id].phase !== "attempt"
            ).length;
            const correctCount = group.correctCount;
            const percent = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;

            return (
              <div key={`${group.subject}:${group.topic}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/70 truncate mr-2">
                    {group.topic}
                  </span>
                  <span className="font-mono text-white/40 shrink-0">
                    {correctCount}/{completedCount} correct ({percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!isPremiumSession && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-indigo-950/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black shadow-lg">
              <Crown className="h-5 w-5 fill-black" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Unlock 2,000+ Real Past Questions</h4>
              <p className="text-xs text-white/60">Upgrade to StudyBond Premium for unlimited questions, real UI post utme past exams, and full topic analytics.</p>
            </div>
          </div>
          <a
            href="/dashboard/settings"
            className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-[#e09040] hover:from-amber-500 hover:to-[#d08030] text-black font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Upgrade to Premium</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* CTA Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Button
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-5 bg-[var(--sb-study-accent)] hover:bg-[var(--sb-study-accent)]/80 text-white font-bold rounded-xl shadow-lg shadow-[var(--sb-study-glow)]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Study Again
        </Button>
        <Button
          variant="ghost"
          onClick={onBackToDashboard}
          className="w-full sm:w-auto px-6 py-5 border-white/10 text-white hover:bg-white/[0.04]"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
