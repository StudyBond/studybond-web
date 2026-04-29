"use client";

import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Crown,
  Flame,
  Lock,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { Achievement } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type AchievementRailProps = {
  query: UseQueryResult<Achievement[], Error>;
};

const achievementIcons: Record<string, ReactNode> = {
  first_exam: <Target className="h-5 w-5" />,
  streak_7: <Flame className="h-5 w-5" />,
  streak_14: <Flame className="h-5 w-5" />,
  streak_30: <Flame className="h-5 w-5" />,
  exams_10: <BookOpen className="h-5 w-5" />,
  exams_25: <BookOpen className="h-5 w-5" />,
  exams_50: <Star className="h-5 w-5" />,
  exams_100: <Crown className="h-5 w-5" />,
  sp_1000: <Zap className="h-5 w-5" />,
  sp_5000: <Zap className="h-5 w-5" />,
  sp_10000: <Award className="h-5 w-5" />,
  perfect_score: <Trophy className="h-5 w-5" />,
  duel_win: <Shield className="h-5 w-5" />,
};

function getIcon(key: string) {
  return achievementIcons[key] ?? <Star className="h-5 w-5" />;
}

function isRecentlyUnlocked(achievement: Achievement) {
  if (!achievement.unlockedAt) return false;

  const unlockedAt = new Date(achievement.unlockedAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return unlockedAt > sevenDaysAgo;
}

function getAchievementProgress(achievement: Achievement) {
  const percentage = achievement.progress?.percentage ?? 0;
  return Math.max(0, Math.min(100, percentage));
}

function getAchievementTitle(achievement: Achievement) {
  return [achievement.title, achievement.description].filter(Boolean).join(" - ");
}

export function AchievementRail({ query }: AchievementRailProps) {
  if (query.isLoading) {
    return (
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-24 shrink-0 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (!query.data || query.data.length === 0) {
    return null;
  }

  const achievements = query.data;
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  const locked = achievements.filter((achievement) => !achievement.unlocked);
  const sorted = [...unlocked, ...locked];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[var(--sb-bg-surface-1)] to-[#09090b] p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.1)]">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Achievements
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold text-white/30">
            {unlocked.length}/{achievements.length} unlocked
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400/60 to-yellow-400 transition-all duration-1000 ease-out"
              style={{
                width: `${(unlocked.length / achievements.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 sb-scroll-hide">
        {sorted.map((achievement, index) => {
          const isUnlocked = !!achievement.unlocked;
          const isNew = isUnlocked && isRecentlyUnlocked(achievement);
          const progressPct = getAchievementProgress(achievement);

          return (
            <div
              key={achievement.key}
              className={cn(
                "group relative flex min-w-[92px] shrink-0 flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all duration-300",
                isUnlocked
                  ? "border-yellow-400/20 bg-yellow-400/[0.04] hover:-translate-y-1 sb-badge-unlock"
                  : "border-white/[0.04] bg-white/[0.02] opacity-50 hover:opacity-70",
              )}
              style={isUnlocked ? { animationDelay: `${index * 80}ms` } : undefined}
              title={getAchievementTitle(achievement)}
            >
              {isNew ? (
                <div className="absolute -top-1.5 -right-1.5 z-20">
                  <div className="flex items-center gap-0.5 rounded-full bg-yellow-400 px-1.5 py-0.5 shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                    <Sparkles className="h-2 w-2 text-[#09090b]" />
                    <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#09090b]">
                      New
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="relative">
                {!isUnlocked && progressPct > 0 ? (
                  <svg
                    className="absolute -inset-1.5 h-12 w-12 -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white/[0.05]"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={88}
                      strokeDashoffset={88 - (88 * progressPct) / 100}
                      strokeLinecap="round"
                      className="text-white/20 transition-all duration-1000 ease-out"
                    />
                  </svg>
                ) : null}

                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                    isUnlocked ? "text-yellow-400" : "text-white/20",
                  )}
                >
                  {isUnlocked ? getIcon(achievement.key) : <Lock className="h-4 w-4" />}
                </div>
              </div>

              <span
                className={cn(
                  "max-w-[76px] text-center text-[10px] font-semibold leading-tight",
                  isUnlocked ? "text-white/70" : "text-white/25",
                )}
              >
                {achievement.title}
              </span>

              {!isUnlocked && progressPct > 0 ? (
                <span className="text-[8px] font-mono font-bold text-white/15">
                  {Math.round(progressPct)}%
                </span>
              ) : null}

              {isUnlocked ? (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-yellow-400/[0.03] to-transparent" />
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 -translate-x-full animate-[sb-shimmer-sweep_3s_ease-in-out_1s_1_forwards] bg-gradient-to-r from-transparent via-yellow-400/[0.06] to-transparent" />
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
