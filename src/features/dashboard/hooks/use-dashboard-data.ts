"use client";

import { getMe } from "@/lib/api/auth";
import { getStreakSummary } from "@/lib/api/streaks";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import { getUserProfile, getUserStats } from "@/lib/api/users";
import { useQuery } from "@tanstack/react-query";

/** Profile, stats and streak: the data most learner pages wait for. */
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

/**
 * The premium plan status, only fetched for premium students. The study
 * page reads it; the old dashboard's other premium queries went with it.
 */
export function useDashboardPremiumData(isPremium: boolean) {
  const subscription = useQuery({
    queryKey: ["dashboard", "subscription-status"],
    queryFn: getSubscriptionStatus,
    enabled: isPremium,
  });

  return { subscription };
}
