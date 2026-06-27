"use client";

import { AchievementRail } from "@/features/dashboard/components/achievement-rail";
import { AnalyticsPanel } from "@/features/dashboard/components/analytics-panel";
import { CollaborationCard } from "@/features/dashboard/components/collaboration-card";
import { CommandBar } from "@/features/dashboard/components/command-bar";
import { ExamCountdown } from "@/features/dashboard/components/exam-countdown";
import { ExamHistoryPanel } from "@/features/dashboard/components/exam-history-panel";
import { RankPanel } from "@/features/dashboard/components/rank-panel";
import { StatTile } from "@/features/dashboard/components/stat-tile";
import { StreakHeatmap } from "@/features/dashboard/components/streak-heatmap";
import type {
  ExamHistory,
  ExamSummary,
  MyRank,
  StreakSummary,
  UserProfile,
  UserStats,
  SubscriptionStatus,
  Achievement,
  StreakCalendar,
  BookmarksSummary,
  Leaderboard,
} from "@/lib/api/types";
import { formatCompact, formatInteger, formatPercent } from "@/lib/utils/format";
import { Zap, CheckCircle, Bookmark, TrendingUp, Crown, Brain, Sparkles, Clock, MessageCircle } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";

const PREMIUM_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/HGHGmxBYOtzDwzOyrb6GVx?s=sh&p=a&ilr=1';

interface PracticeTimeResult {
  value: string;
  sub: string;
}

function computeWeeklyPracticeTime(exams: ExamSummary[]): PracticeTimeResult {
  if (!exams || exams.length === 0) return { value: "0m", sub: "No practice yet" };
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Filter to completed exams only and within the last 7 days
  const weeklyExams = exams.filter(e => {
    // Use completedAt if available, otherwise use startedAt
    const refDate = e.completedAt ? new Date(e.completedAt) : new Date(e.startedAt);
    return refDate >= sevenDaysAgo && e.timeTakenSeconds && e.timeTakenSeconds > 0;
  });
  
  const weeklySeconds = weeklyExams.reduce((acc, e) => acc + (e.timeTakenSeconds || 0), 0);
  
  if (weeklySeconds === 0) return { value: "0m", sub: "This week" };
  
  const hours = Math.floor(weeklySeconds / 3600);
  const minutes = Math.floor((weeklySeconds % 3600) / 60);
  
  const value = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { value, sub: "This week" };
}

type PremiumDashboardProps = {
  profile: UserProfile;
  stats: UserStats;
  streak: StreakSummary;
  examsQuery: UseQueryResult<ExamHistory, Error>;
  rankQuery: UseQueryResult<MyRank, Error>;
  subscriptionQuery: UseQueryResult<SubscriptionStatus, Error>;
  achievementsQuery: UseQueryResult<Achievement[], Error>;
  streakCalendarQuery: UseQueryResult<StreakCalendar, Error>;
  bookmarksQuery: UseQueryResult<BookmarksSummary, Error>;
  leaderboardQuery: UseQueryResult<Leaderboard, Error>;
};

/* ─── Study Insights Card ─── */

function StudyInsightsCard({
  stats,
  streak,
  examsQuery,
  rankQuery,
}: {
  stats: UserStats;
  streak: StreakSummary;
  examsQuery: UseQueryResult<ExamHistory, Error>;
  rankQuery: UseQueryResult<MyRank, Error>;
}) {
  const insights: string[] = [];

  // Weekly performance insight
  if (stats.weeklySp > 0) {
    insights.push(`You've earned ${formatCompact(stats.weeklySp)} SP this week — keep the momentum strong.`);
  }

  // Streak insight
  if (streak.currentStreak >= 7) {
    insights.push(`Incredible ${streak.currentStreak}-day streak! Top performers maintain streaks of 14+ days.`);
  } else if (streak.currentStreak >= 3) {
    insights.push(`${streak.currentStreak}-day streak building nicely. Push to 7 days for a milestone reward.`);
  }

  // Performance trend
  if (examsQuery.data && examsQuery.data.exams.length >= 3) {
    const recent = examsQuery.data.exams.slice(0, 3);
    const avgRecent = recent.reduce((s, e) => s + e.percentage, 0) / recent.length;
    if (avgRecent >= 70) {
      insights.push(`Your last 3 exams averaged ${Math.round(avgRecent)}% — you're in strong form.`);
    } else if (avgRecent >= 40) {
      insights.push(`Recent average: ${Math.round(avgRecent)}%. Focus on your weaker subjects to push above 70%.`);
    }
  }

  // Rank insight
  if (rankQuery.data?.weekly.rank && rankQuery.data.weekly.totalParticipants > 0) {
    const percentile = Math.max(1, Math.ceil((rankQuery.data.weekly.rank / rankQuery.data.weekly.totalParticipants) * 100));
    if (percentile <= 10) {
      insights.push(`You're in the top ${percentile}% of your institution this week. Elite territory.`);
    } else if (percentile <= 30) {
      insights.push(`Top ${percentile}% this week. A few more exams could push you into the top 10%.`);
    }
  }

  if (insights.length === 0) {
    insights.push("Take more exams this week to unlock personalized study insights.");
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-yellow-400/10 bg-gradient-to-r from-yellow-400/[0.03] to-transparent p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400 shrink-0 shadow-[0_0_16px_rgba(251,191,36,0.1)]">
          <Brain className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-bold text-white/70">Study Insights</h3>
            <span className="text-[8px] font-bold uppercase tracking-widest text-yellow-400/50 bg-yellow-400/[0.06] px-1.5 py-0.5 rounded-md">
              Elite
            </span>
          </div>
          <div className="space-y-1.5">
            {insights.slice(0, 3).map((insight, i) => (
              <p key={i} className="text-[12px] text-white/45 leading-relaxed flex items-start gap-2">
                <Sparkles className="h-3 w-3 text-yellow-400/40 mt-0.5 shrink-0" />
                {insight}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-yellow-400/[0.05] blur-[30px]" />
    </div>
  );
}

export function PremiumDashboard({
  profile,
  stats,
  streak,
  examsQuery,
  rankQuery,
  subscriptionQuery,
  achievementsQuery,
  streakCalendarQuery,
  bookmarksQuery,
  leaderboardQuery,
}: PremiumDashboardProps) {
  const subscription = subscriptionQuery.data ?? null;
  const bookmarkLimits = bookmarksQuery.data?.limits;

  // Compute real metrics
  const weeklyDelta = stats.weeklySp > 0 ? `+${formatCompact(stats.weeklySp)} this week` : "No activity this week";

  const successRate =
    stats.completedExams + stats.abandonedExams > 0
      ? Math.round((stats.completedExams / (stats.completedExams + stats.abandonedExams)) * 100)
      : 0;

  const rankPercentile =
    rankQuery.data?.weekly.rank && rankQuery.data.weekly.totalParticipants > 0
      ? `Top ${Math.max(1, Math.ceil((rankQuery.data.weekly.rank / rankQuery.data.weekly.totalParticipants) * 100))}%`
      : null;

  const bookmarkUsage = bookmarkLimits
    ? Math.round((bookmarkLimits.activeBookmarks / bookmarkLimits.maxBookmarks) * 100)
    : 0;

  const practiceTime = computeWeeklyPracticeTime(examsQuery.data?.exams || []);

  return (
    <>
      {/* ── Command Bar Hero ── */}
      <CommandBar
        profile={profile}
        stats={stats}
        streak={streak}
        subscription={subscription}
      />

      {/* ── Exam Countdown ── */}
      <section className="sb-enter mt-6">
        <ExamCountdown />
      </section>

      {/* ── Study Insights (Elite exclusive) ── */}
      <section className="sb-enter mt-6 sb-stagger-1">
        <StudyInsightsCard
          stats={stats}
          streak={streak}
          examsQuery={examsQuery}
          rankQuery={rankQuery}
        />
      </section>

      {/* ── Premium Community Group ── */}
      <section className="sb-enter mt-6 sb-stagger-1">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/10 bg-gradient-to-r from-emerald-400/[0.03] to-transparent p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 shrink-0 shadow-[0_0_16px_rgba(52,211,153,0.1)]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-xs font-bold text-white/70">Premium Community</h3>
                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/50 bg-emerald-400/[0.06] px-1.5 py-0.5 rounded-md">
                  Members Only
                </span>
              </div>
              <p className="text-[12px] text-white/45 leading-relaxed mb-3">
                Connect with other premium students in our private WhatsApp group. Brainstorm, share tips, and push each other forward.
              </p>
              <a
                href={PREMIUM_WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 text-[11px] font-semibold transition-all duration-200 hover:bg-emerald-400/15 hover:shadow-[0_0_12px_rgba(52,211,153,0.1)]"
              >
                <MessageCircle className="h-3 w-3" />
                Join Group
              </a>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-emerald-400/[0.05] blur-[30px]" />
        </div>
      </section>

      {/* ── Performance Bento Grid ── */}
      <section className="sb-enter mt-6 grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 sb-stagger-2">
        {/* Hero tile: Total SP (full-width, cinematic) */}
        <StatTile
          className="col-span-2 sm:col-span-4 lg:col-span-2"
          icon={<Zap className="h-4 w-4" />}
          label="Total SP"
          tone="accent"
          variant="hero"
          value={formatCompact(stats.totalSp)}
          numericValue={stats.totalSp}
          subMetric={weeklyDelta}
          subMetricTone="positive"
        />

        {/* Secondary stats */}
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Weekly SP"
          tone="info"
          variant="compact"
          value={formatCompact(stats.weeklySp)}
          numericValue={stats.weeklySp}
          subMetric={rankPercentile ?? undefined}
          subMetricTone="positive"
        />
        <StatTile
          icon={<CheckCircle className="h-4 w-4" />}
          label="Exams Completed"
          tone="success"
          variant="compact"
          value={formatInteger(stats.completedExams)}
          numericValue={stats.completedExams}
          subMetric={`${successRate}% completion rate`}
          subMetricTone={successRate >= 80 ? "positive" : "neutral"}
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
          icon={<Bookmark className="h-4 w-4" />}
          label="Bookmarks"
          tone="gold"
          variant="compact"
          value={bookmarkLimits ? `${bookmarkLimits.activeBookmarks}` : formatInteger(stats.bookmarkedQuestions)}
          numericValue={bookmarkLimits ? bookmarkLimits.activeBookmarks : stats.bookmarkedQuestions}
          capacity={bookmarkUsage}
          capacityLabel={bookmarkLimits ? `${bookmarkLimits.remainingBookmarks}` : undefined}
        />
      </section>

      {/* ── Analytics + Exam History Row ── */}
      <section className="sb-enter mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] sb-stagger-4">
        <AnalyticsPanel query={examsQuery} />
        <ExamHistoryPanel query={examsQuery} variant="full" />
      </section>

      {/* ── Streak Heatmap ── */}
      <section className="sb-enter mt-6 sb-stagger-5">
        <StreakHeatmap query={streakCalendarQuery} />
      </section>

      {/* ── Achievement Rail ── */}
      <section className="sb-enter mt-6 sb-stagger-6">
        <AchievementRail query={achievementsQuery} />
      </section>

      {/* ── Rank + Collaboration ── */}
      <section className="sb-enter mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] sb-stagger-7">
        <RankPanel query={rankQuery} variant="full" />
        <CollaborationCard stats={stats} />
      </section>

      {/* ── Top Players Preview (from leaderboard) ── */}
      {leaderboardQuery.data && leaderboardQuery.data.entries.length > 0 ? (
        <section className="sb-enter mt-6 sb-stagger-8">
          <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[var(--sb-bg-surface-1)] to-[#09090b] p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.1)]">
                <Crown className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Top Players This Week
              </span>
            </div>

            <div className="space-y-2">
              {leaderboardQuery.data.entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                    entry.isCurrentUser
                      ? "bg-[#e09040]/[0.06] border border-[#e09040]/15 shadow-[0_0_12px_rgba(224,144,64,0.05)]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`font-mono text-sm font-bold w-8 ${
                    entry.rank <= 3 ? "sb-gradient-text-gold" : "text-white/40"
                  }`}>
                    #{entry.rank}
                  </span>
                  <span className={`text-sm flex-1 truncate ${entry.isCurrentUser ? "text-white font-semibold" : "text-white/60"}`}>
                    {entry.fullName}
                    {entry.isCurrentUser ? <span className="text-[10px] text-[#e09040] ml-2">(you)</span> : null}
                  </span>
                  <span className="font-mono text-xs text-white/40">{formatCompact(entry.points)} SP</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
