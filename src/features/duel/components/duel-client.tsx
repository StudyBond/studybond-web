"use client";

import { Loader2 } from "lucide-react";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { DuelHome } from "@/features/duel/home/duel-home";

export function DuelClient() {
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
        <div className="p-8 text-center text-red-400">
          Could not load your duels.
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell
      isPremium={critical.profile.data.isPremium}
      profile={critical.profile.data}
    >
      <DuelHome
        profile={critical.profile.data}
        stats={critical.stats.data}
      />
    </LearnerShell>
  );
}
