import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { MyRank } from "@/lib/api/types";
import { formatInteger } from "@/lib/utils/format";
import { Trophy, Crown } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";

function rankDisplay(rank: number | null) {
  if (rank === null || rank === undefined) return "—";
  return `#${rank}`;
}

export function RankPanel({ query, variant = "full" }: { query: UseQueryResult<MyRank, Error>; variant?: "full" | "compact" }) {
  if (query.isLoading) {
    return <Skeleton className="min-h-48 rounded-3xl" />;
  }

  if (query.isError) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6">
        <EmptyState icon={<Trophy className="h-5 w-5" />} description="Something went wrong." title="Could not load rank" />
      </div>
    );
  }

  if (!query.data || query.data.weekly.rank === null) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6">
        <EmptyState icon={<Trophy className="h-5 w-5" />} description="Complete an exam to enter the leaderboard." title="No rank yet" />
      </div>
    );
  }

  const data = query.data;
  const rank = data.weekly.rank;
  const isTop3 = rank !== null && rank <= 3;
  const total = data.weekly.totalParticipants;
  const percentile = total > 0 && rank !== null ? Math.max(1, Math.ceil((rank / total) * 100)) : null;
  const visualPercent = total > 0 && rank !== null ? Math.max(5, Math.min(95, 100 - ((rank / total) * 100))) : 50;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#0d0b08] p-6 sm:p-8">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-yellow-500/[0.06] blur-[40px]" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTop3 ? (
            <Crown className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          ) : (
            <Trophy className="h-5 w-5 text-[#e09040]" />
          )}
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Rank</span>
        </div>
        <Badge tone="accent">
          {data.institution.code} Weekly
        </Badge>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className={`font-mono text-4xl font-extrabold tracking-tighter drop-shadow-md ${isTop3 ? "sb-gradient-text-gold" : "text-white"}`}>
          {rankDisplay(rank)}
        </span>
        <span className="text-sm font-medium text-white/35">of {formatInteger(total)}</span>
      </div>
      {percentile !== null ? (
        <p className="mt-1 text-xs text-white/30">Top {percentile}% of test takers</p>
      ) : null}

      {/* Race bar */}
      <div className="mt-6 relative h-7 w-full">
        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-[#18181b] border border-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-[rgba(224,144,64,0.15)] to-[#e09040] opacity-25 transition-all duration-1000 ease-out"
            style={{ width: `${visualPercent}%` }}
          />
        </div>
        <div
          className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out rounded-full z-20"
          style={{ left: `calc(${visualPercent}% - 1px)` }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white font-mono whitespace-nowrap">
            {rankDisplay(rank)}
          </div>
        </div>
        <div className="absolute -top-0.5 -bottom-0.5 -right-0.5 z-10">
          <Crown className="h-3 w-3 text-yellow-500 absolute -top-4 right-0" />
        </div>
      </div>

      {variant === "full" ? (
        <div className="mt-6 grid grid-cols-2 gap-2.5 pt-5 border-t border-white/[0.04]">
          <div className="rounded-xl border border-white/[0.03] bg-white/[0.02] p-3.5 text-center transition-colors hover:bg-white/[0.03]">
            <p className="text-[9px] uppercase tracking-wider text-white/35 mb-1">Weekly</p>
            <p className="font-mono text-xl font-bold text-white">{formatInteger(data.weekly.points)} <span className="text-[9px] text-white/25">SP</span></p>
          </div>
          <div className="rounded-xl border border-white/[0.03] bg-white/[0.02] p-3.5 text-center transition-colors hover:bg-white/[0.03]">
            <p className="text-[9px] uppercase tracking-wider text-white/35 mb-1">All-Time</p>
            <p className="font-mono text-xl font-bold text-[#e09040]">{rankDisplay(data.allTime.rank)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
