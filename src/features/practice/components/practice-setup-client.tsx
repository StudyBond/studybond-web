"use client";

import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { PracticeSetupPage } from "@/features/practice/components/practice-setup";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { Loader2 } from "lucide-react";

export function PracticeSetupClient() {
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

  if (critical.isError || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-red-400">Failed to load essential data.</div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell profile={critical.profile.data}>
      <PracticeSetupPage profile={critical.profile.data} />
    </LearnerShell>
  );
}
