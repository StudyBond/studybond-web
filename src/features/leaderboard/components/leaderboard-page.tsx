"use client";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { useWeeklyLeaderboard } from "@/features/leaderboard/hooks/use-leaderboard";
import { LeaderboardPodium } from "@/features/leaderboard/components/leaderboard-podium";
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list";
import { LeaderboardUserRank } from "@/features/leaderboard/components/leaderboard-user-rank";
import { Loader2, Users } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";

export function LeaderboardPageClient() {
  const critical = useDashboardCriticalData();
  const { data: leaderboard, isLoading, isError, error } = useWeeklyLeaderboard(50);

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
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8 min-h-screen relative">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6 max-w-4xl mx-auto">
           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <Users className="h-6 w-6" />
           </div>
           <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Institution Leaderboard</h1>
              <p className="text-sm text-white/50">Top weekly performers at {leaderboard?.institution.name || "your institution"}.</p>
           </div>
        </div>

        {/* Content */}
        {isLoading ? (
           <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
           </div>
        ) : isError || !leaderboard ? (
           <div className="py-12">
             <ErrorState 
                title="Failed to load leaderboard." 
                description={error instanceof Error ? error.message : "We couldn't fetch the rankings right now. Please try again later."}
                actionLabel="Try Again"
                onAction={() => window.location.reload()}
             />
           </div>
        ) : leaderboard.entries.length === 0 ? (
           <div className="py-24 text-center">
             <h2 className="text-xl font-bold text-white/50 mb-2">Nobody is on the board yet</h2>
             <p className="text-white/30">Take an exam to score some SP and claim the #1 spot!</p>
           </div>
        ) : (
           <div className="animate-in fade-in duration-500">
              {/* Top 3 Podium */}
              {leaderboard.entries.length > 0 && (
                 <LeaderboardPodium topThree={leaderboard.entries.slice(0, 3)} />
              )}
              
              {/* Rank 4+ List */}
              {leaderboard.entries.length > 3 && (
                 <LeaderboardList entries={leaderboard.entries.slice(3)} />
              )}
           </div>
        )}

      </div>
      
      {/* Sticky personal rank footer */}
      <LeaderboardUserRank />
    </LearnerShell>
  );
}
