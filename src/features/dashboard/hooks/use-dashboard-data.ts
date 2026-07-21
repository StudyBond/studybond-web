"use client";

import { getAchievements } from "@/lib/api/achievements";
import { getMe } from "@/lib/api/auth";
import { getBookmarksSummary } from "@/lib/api/bookmarks";
import { getExamHistory } from "@/lib/api/exams";
import { getMyRank, getWeeklyLeaderboard } from "@/lib/api/leaderboard";
import { getStreakCalendar, getStreakSummary } from "@/lib/api/streaks";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import { getUserProfile, getUserStats } from "@/lib/api/users";
import { useQuery } from "@tanstack/react-query";

/** Critical data needed before any dashboard variant can render. */
export function useDashboardCriticalData() {
  // Auth check FIRST - wait for auth/me to succeed before other queries
  const me = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    staleTime: Infinity, // Only fetch once per page load
  });

  // Gate all other queries behind successful auth
  const profile = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getUserProfile,
    enabled: me.isSuccess, // Only fetch after auth succeeds
  });

  const stats = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getUserStats,
    enabled: me.isSuccess, // Only fetch after auth succeeds
  });

  const streak = useQuery({
    queryKey: ["dashboard", "streak"],
    queryFn: getStreakSummary,
    enabled: me.isSuccess, // Only fetch after auth succeeds
  });

  return {
    me,
    profile,
    stats,
    streak,
    isLoading:
      me.isLoading || profile.isLoading || stats.isLoading || streak.isLoading,
    isError: me.isError || profile.isError || stats.isError || streak.isError,
  };
}

/** Secondary data that enriches both dashboard variants. */
export function useDashboardSecondaryData(limit = 50) {
  const exams = useQuery({
    queryKey: ["dashboard", "exam-history", limit],
    queryFn: () => getExamHistory({ limit }),
  });

  const rank = useQuery({
    queryKey: ["dashboard", "my-rank"],
    queryFn: getMyRank,
  });

  return { exams, rank };
}

/**
 * Premium-only data — gated behind `isPremium` flag.
 * These queries won't fire for free users, avoiding unnecessary network calls.
 */
export function useDashboardPremiumData(isPremium: boolean) {
  const subscription = useQuery({
    queryKey: ["dashboard", "subscription-status"],
    queryFn: getSubscriptionStatus,
    enabled: isPremium,
  });

  const achievements = useQuery({
    queryKey: ["dashboard", "achievements"],
    queryFn: getAchievements,
    enabled: isPremium,
  });

  const streakCalendar = useQuery({
    queryKey: ["dashboard", "streak-calendar", 30],
    queryFn: () => getStreakCalendar(30),
    enabled: isPremium,
  });

  const bookmarks = useQuery({
    queryKey: ["dashboard", "bookmarks-summary"],
    queryFn: getBookmarksSummary,
    enabled: isPremium,
  });

  const leaderboard = useQuery({
    queryKey: ["dashboard", "weekly-leaderboard"],
    queryFn: () => getWeeklyLeaderboard(10),
    enabled: isPremium,
  });

  return {
    subscription,
    achievements,
    streakCalendar,
    bookmarks,
    leaderboard,
  };
}
