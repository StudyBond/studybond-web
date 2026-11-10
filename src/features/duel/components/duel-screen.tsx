"use client";

import { Loader2 } from "lucide-react";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import type { UserProfile, UserStats } from "@/lib/api/types";

/** The learner shell around a duel screen, once the profile has loaded. */
export function DuelScreen({
  errorText = "Could not load this page.",
  children,
}: {
  errorText?: string;
  children: (data: { profile: UserProfile; stats: UserStats }) => React.ReactNode;
}) {
  const critical = useDashboardCriticalData();

  if (critical.isLoading) {
    return (
      <LearnerShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
        </div>
      </LearnerShell>
    );
  }

  if (critical.isError || !critical.profile.data || !critical.stats.data) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-red-400">{errorText}</div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell isPremium={critical.profile.data.isPremium} profile={critical.profile.data}>
      {children({ profile: critical.profile.data, stats: critical.stats.data })}
    </LearnerShell>
  );
}
