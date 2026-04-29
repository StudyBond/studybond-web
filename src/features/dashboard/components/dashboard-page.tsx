"use client";

import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ExplorerDashboard } from "@/features/dashboard/components/explorer-dashboard";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { NewUserDashboard } from "@/features/dashboard/components/new-user-dashboard";
import { PremiumDashboard } from "@/features/dashboard/components/premium-dashboard";
import {
  useDashboardCriticalData,
  useDashboardPremiumData,
  useDashboardSecondaryData,
} from "@/features/dashboard/hooks/use-dashboard-data";

export function DashboardPage() {
  const critical = useDashboardCriticalData();
  const secondary = useDashboardSecondaryData();

  const isPremium = critical.profile.data?.isPremium ?? false;
  const premium = useDashboardPremiumData(isPremium);

  if (critical.isLoading) {
    return (
      <LearnerShell>
        <div className="space-y-5">
          <Skeleton className="h-44 w-full rounded-3xl" />
          {/* Hero stat skeleton — taller, matches bento hero */}
          <Skeleton className="h-32 w-full rounded-3xl" />
          {/* Compact stats — 2x2 grid on mobile, 4-col on desktop */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </LearnerShell>
    );
  }

  if (critical.isError || !critical.profile.data || !critical.stats.data || !critical.streak.data) {
    return (
      <LearnerShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <ErrorState
            description="We couldn't load your dashboard. Please try again."
            title="Something went wrong"
            actionLabel="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
      </LearnerShell>
    );
  }

  const profile = critical.profile.data;
  const stats = critical.stats.data;
  const streak = critical.streak.data;
  const isNewUser = stats.completedExams === 0;

  /* ─── 3-Tier Dashboard Routing ─── */
  const dashboardContent = isNewUser ? (
    // Tier 1: Brand-new user — onboarding-focused experience
    <NewUserDashboard
      profile={profile}
      stats={stats}
      streak={streak}
    />
  ) : isPremium ? (
    // Tier 3: Premium (Elite) — full analytics, heatmaps, achievements
    <PremiumDashboard
      profile={profile}
      stats={stats}
      streak={streak}
      examsQuery={secondary.exams}
      rankQuery={secondary.rank}
      subscriptionQuery={premium.subscription}
      achievementsQuery={premium.achievements}
      streakCalendarQuery={premium.streakCalendar}
      bookmarksQuery={premium.bookmarks}
      leaderboardQuery={premium.leaderboard}
    />
  ) : (
    // Tier 2: Explorer (free) — core features + upgrade nudges
    <ExplorerDashboard
      profile={profile}
      stats={stats}
      streak={streak}
      examsQuery={secondary.exams}
      rankQuery={secondary.rank}
    />
  );

  return (
    <LearnerShell isPremium={isPremium} subscriptionData={premium.subscription.data ?? undefined} profile={profile}>
      {dashboardContent}
    </LearnerShell>
  );
}
