"use client";

import { CommandBar } from "@/features/dashboard/components/command-bar";
import { ExamHistoryPanel } from "@/features/dashboard/components/exam-history-panel";
import { PremiumPreviewCard } from "@/features/dashboard/components/premium-preview-card";
import { RankPanel } from "@/features/dashboard/components/rank-panel";
import { StatTile } from "@/features/dashboard/components/stat-tile";
import { StreakPanel } from "@/features/dashboard/components/streak-panel";
import type { ExamHistory, ExamSummary, MyRank, StreakSummary, UserProfile, UserStats } from "@/lib/api/types";
import { formatCompact, formatInteger } from "@/lib/utils/format";
import { Zap, CheckCircle, Flame, Target, Clock } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";

interface PracticeTimeResult {
  value: string;
  sub: string;
}

function computeWeeklyPracticeTime(exams: ExamSummary[]): PracticeTimeResult {
  if (!exams || exams.length === 0) return { value: "0m", sub: "No practice yet" };
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const weeklyExams = exams.filter(e => new Date(e.startedAt) >= sevenDaysAgo);
  const weeklySeconds = weeklyExams.reduce((acc, e) => acc + (e.timeTakenSeconds || 0), 0);
  
  if (weeklySeconds === 0) return { value: "0m", sub: "This week" };
  
  const hours = Math.floor(weeklySeconds / 3600);
  const minutes = Math.floor((weeklySeconds % 3600) / 60);
  
  const value = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { value, sub: "This week" };
}

type ExplorerDashboardProps = {
  profile: UserProfile;
  stats: UserStats;
  streak: StreakSummary;
  examsQuery: UseQueryResult<ExamHistory, Error>;
  rankQuery: UseQueryResult<MyRank, Error>;
};

export function ExplorerDashboard({
  profile,
  stats,
  streak,
  examsQuery,
  rankQuery,
}: ExplorerDashboardProps) {
  const completionRate =
    stats.completedExams + stats.abandonedExams > 0
      ? Math.round((stats.completedExams / (stats.completedExams + stats.abandonedExams)) * 100)
      : 0;

  const practiceTime = computeWeeklyPracticeTime(examsQuery.data?.exams || []);

  return (
    <>
      {/* ── Welcome Hero ── */}
      <CommandBar profile={profile} stats={stats} streak={streak} />

      {/* ── Core Stats — Bento Grid ── */}
      <section className="sb-enter mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 sb-stagger-1">
        {/* Hero tile: Total SP (full-width on mobile/tablet, 2-col span on desktop) */}
        <StatTile
          className="col-span-2 sm:col-span-3 lg:col-span-2"
          icon={<Zap className="h-4 w-4" />}
          label="Total SP"
          tone="accent"
          variant="hero"
          value={formatCompact(stats.totalSp)}
          numericValue={stats.totalSp}
          subMetric={stats.weeklySp > 0 ? `+${formatCompact(stats.weeklySp)} this week` : undefined}
          subMetricTone="positive"
        />

        {/* Secondary stats */}
        <StatTile
          icon={<CheckCircle className="h-4 w-4" />}
          label="Exams Completed"
          tone="success"
          variant="compact"
          value={formatInteger(stats.completedExams)}
          numericValue={stats.completedExams}
          subMetric={completionRate > 0 ? `${completionRate}% completion rate` : undefined}
          subMetricTone={completionRate >= 80 ? "positive" : "neutral"}
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="Practice Time"
          tone="default"
          variant="compact"
          value={practiceTime.value}
          subMetric={practiceTime.sub}
          subMetricTone="neutral"
        />
        <StatTile
          icon={<Flame className="h-4 w-4" />}
          label="Current Streak"
          tone="streak"
          variant="compact"
          className="col-span-2 sm:col-span-1"
          value={`${streak.currentStreak}`}
          numericValue={streak.currentStreak}
          subMetric={streak.currentStreak > 0 ? `Best: ${streak.longestStreak} days` : undefined}
          subMetricTone="neutral"
        />
      </section>

      {/* ── Daily Goal Tracker ── */}
      <section className="sb-enter mt-6 sb-stagger-3">
        <DailyGoalCard streak={streak} />
      </section>

      {/* ── Exam History + Streak ── */}
      <section className="sb-enter mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] sb-stagger-4">
        <ExamHistoryPanel query={examsQuery} variant="compact" />
        <div className="space-y-5">
          <StreakPanel streak={streak} />
          <RankPanel query={rankQuery} variant="compact" />
        </div>
      </section>

      {/* ── Premium Feature Preview ── */}
      <section className="sb-enter mt-6 sb-stagger-5">
        <PremiumPreviewCard />
      </section>
    </>
  );
}

/* ─── Daily Goal Card ─── */

function DailyGoalCard({ streak }: { streak: StreakSummary }) {
  const goal = 1; // 1 exam per day baseline
  const completed = streak.today.examsTaken;
  const progress = Math.min(100, (completed / goal) * 100);
  const isComplete = completed >= goal;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--sb-bg-surface-1)] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 ${
            isComplete
              ? "bg-emerald-400/15 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.2)]"
              : "bg-white/[0.04] text-white/30"
          }`}>
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/70">
              {isComplete ? "Daily Goal Complete!" : "Daily Goal"}
            </p>
            <p className="text-[11px] text-white/30">
              {isComplete
                ? `${completed} exam${completed > 1 ? "s" : ""} taken today — you're on fire`
                : "Complete at least 1 exam today to keep your streak"}
            </p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="currentColor"
              strokeWidth="3" className="text-white/[0.04]"
            />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={88}
              strokeDashoffset={88 - (88 * progress) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${
                isComplete ? "text-emerald-400" : "text-[#e09040]"
              }`}
            />
          </svg>
          <span className={`absolute text-[10px] font-bold font-mono ${
            isComplete ? "text-emerald-400" : "text-white/50"
          }`}>
            {completed}/{goal}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isComplete
              ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
              : "bg-gradient-to-r from-[#e09040] to-orange-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Completion glow */}
      {isComplete ? (
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-emerald-400/[0.08] blur-[40px]" />
      ) : null}
    </div>
  );
}
