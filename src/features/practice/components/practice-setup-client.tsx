"use client";

import { Suspense } from "react";

import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { PracticePage } from "@/features/practice/practice-page";

export function PracticeSetupClient() {
  const critical = useDashboardCriticalData();

  if (critical.isLoading) {
    return (
      <LearnerShell>
        <div className="sb-ui mx-auto max-w-[1040px] pt-1">
          <div className="h-5 w-64 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-[76px] animate-pulse rounded-[14px] bg-white/[0.05]" />)}
          </div>
          <div className="mt-6 h-[300px] animate-pulse rounded-[16px] bg-white/[0.04]" />
        </div>
      </LearnerShell>
    );
  }

  if (critical.isError || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="sb-ui p-8 text-center text-sm text-[#a1a1aa]">
          We couldn&apos;t load this page. Check your connection, then refresh.
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell profile={critical.profile.data} isPremium={critical.profile.data.isPremium}>
      <Suspense>
        <PracticePage profile={critical.profile.data} />
      </Suspense>
    </LearnerShell>
  );
}
