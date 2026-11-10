"use client";

import { Loader2 } from "lucide-react";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { AvatarMaker } from "@/features/avatar/components/avatar-maker";

export function AvatarMakerPage() {
  const critical = useDashboardCriticalData();

  if (critical.isLoading || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="flex h-[50vh] items-center justify-center">
          {critical.isError ? (
            <p className="text-sm text-white/60">We couldn&apos;t load your profile. Refresh to try again.</p>
          ) : (
            <Loader2 className="h-7 w-7 animate-spin text-[#e09040] opacity-60" />
          )}
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell profile={critical.profile.data}>
      <AvatarMaker profile={critical.profile.data} />
    </LearnerShell>
  );
}
