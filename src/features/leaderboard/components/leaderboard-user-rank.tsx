"use client";

import { useMyRank } from "@/features/leaderboard/hooks/use-leaderboard";
import { cn } from "@/lib/utils/cn";
import { Loader2, ArrowUpCircle } from "lucide-react";

export function LeaderboardUserRank() {
  const { data: rankData, isLoading } = useMyRank();

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64 flex h-20 items-center justify-center border-t border-white/[0.06] bg-[var(--sb-bg)]/80 backdrop-blur-xl">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--sb-accent)] opacity-50" />
      </div>
    );
  }

  if (!rankData) return null;

  const currentRank = rankData.weekly.rank;
  const points = rankData.weekly.points;
  const total = rankData.weekly.totalParticipants;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64 border-t border-white/[0.06] bg-[var(--sb-bg)]/80 backdrop-blur-xl pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8 shadow-inner animate-in slide-in-from-bottom border-t border-white/[0.02]">
        
        {/* Left Side: Rank */}
        <div className="flex items-center gap-4">
           {currentRank ? (
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Your Rank</span>
                 <div className="flex items-baseline gap-1">
                    <span className="sb-mono text-2xl font-black text-[var(--sb-accent)]">
                       #{currentRank}
                    </span>
                    <span className="text-xs font-semibold text-white/30 hidden sm:inline">of {total}</span>
                 </div>
              </div>
           ) : (
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Your Rank</span>
                 <span className="text-sm font-semibold text-white/60">Unranked</span>
              </div>
           )}
        </div>

        {/* Right Side: Points & Motivation */}
        <div className="flex items-center gap-4 text-right">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Weekly SP</span>
              <span className="sb-mono text-lg font-bold text-emerald-400">
                 {points.toLocaleString()}
              </span>
           </div>
           
           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white/20 hidden sm:flex">
              <ArrowUpCircle className="h-5 w-5" />
           </div>
        </div>
        
      </div>
    </div>
  );
}
