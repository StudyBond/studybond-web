"use client";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { HistoryList } from "@/features/history/components/history-list";
import { Loader2, History as HistoryIcon } from "lucide-react";

export function HistoryPageClient() {
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
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 pb-24 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sb-accent)]/10 text-[var(--sb-accent)] shadow-[0_0_20px_var(--sb-accent-glow)]">
              <HistoryIcon className="h-6 w-6" />
           </div>
           <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Exam History</h1>
              <p className="text-sm text-white/50">Review past performances, check explanations, or retake exams.</p>
           </div>
        </div>

        {/* History List */}
        <HistoryList />

      </div>
    </LearnerShell>
  );
}
