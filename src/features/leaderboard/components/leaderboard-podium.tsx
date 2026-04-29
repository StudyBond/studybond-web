"use client";

import { cn } from "@/lib/utils/cn";
import { Trophy, Crown, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/api/types";

type LeaderboardPodiumProps = {
  topThree: LeaderboardEntry[];
};

export function LeaderboardPodium({ topThree }: LeaderboardPodiumProps) {
  // Sort them so rank 2 is left, rank 1 is center, rank 3 is right
  const rank1 = topThree.find((e) => e.rank === 1);
  const rank2 = topThree.find((e) => e.rank === 2);
  const rank3 = topThree.find((e) => e.rank === 3);

  // Helper to render a podium step
  const renderStep = (
    entry: LeaderboardEntry | undefined,
    position: "left" | "center" | "right",
    rankNum: number
  ) => {
    if (!entry) return <div className="flex-1" />; // Placeholder if < 3 players exist

    const isCenter = position === "center";
    
    // Height adjustments
    const heightClass = isCenter ? "h-40 md:h-48" : position === "left" ? "h-32 md:h-40" : "h-28 md:h-32";
    
    // Icon and colors
    const icon = isCenter ? (
      <Crown className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] mb-2" />
    ) : position === "left" ? (
      <Medal className="h-6 w-6 text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.6)] mb-2" />
    ) : (
      <Medal className="h-6 w-6 text-amber-700 drop-shadow-[0_0_6px_rgba(180,83,9,0.6)] mb-2" />
    );

    const stepColor = isCenter 
      ? "bg-gradient-to-t from-yellow-500/10 to-yellow-500/30 border-yellow-500/40"
      : position === "left"
        ? "bg-gradient-to-t from-slate-400/10 to-slate-400/20 border-slate-400/30"
        : "bg-gradient-to-t from-amber-700/10 to-amber-700/20 border-amber-700/30";

    const glowColor = isCenter ? "bg-yellow-400/20" : position === "left" ? "bg-slate-300/10" : "bg-amber-700/10";
    
    // Name formatting (split name onto two lines if possible)
    const nameParts = entry.fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[1] : "";

    return (
      <div className={cn(
        "flex flex-1 flex-col items-center justify-end relative animate-in slide-in-from-bottom-8 fade-in duration-700",
        isCenter ? "z-10" : "z-0",
        position === "left" && "delay-150",
        position === "right" && "delay-300"
      )}>
        
        {/* Avatar/Icon area over the step */}
        <div className="flex flex-col items-center justify-center mb-2 text-center">
            {icon}
            <div className={cn(
                "font-bold text-white tracking-tight leading-none mb-1",
                isCenter ? "text-lg md:text-xl" : "text-sm md:text-base",
                entry.isCurrentUser && "text-[var(--sb-accent)]"
            )}>
                {firstName}
                <br />
                {lastName}
            </div>
            {entry.isCurrentUser && (
                <span className="inline-flex rounded bg-[var(--sb-accent)]/20 px-1 py-0.5 text-[9px] font-bold uppercase text-[var(--sb-accent)]">You</span>
            )}
            <div className={cn(
                "sb-mono font-bold mt-1",
                isCenter ? "text-yellow-400 text-base" : "text-white/60 text-xs"
            )}>
               {entry.points.toLocaleString()} SP
            </div>
        </div>

        {/* The physical step block */}
        <div className={cn(
            "w-full rounded-t-2xl border-t border-x relative overflow-hidden backdrop-blur-md shadow-2xl",
            heightClass,
            stepColor
        )}>
            {/* Inner top glow */}
            <div className={cn("absolute top-0 left-0 right-0 h-1 blur-sm", glowColor)} />
            
            {/* Rank Number inside step */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                    "text-6xl md:text-8xl font-black opacity-[0.08]",
                    isCenter ? "text-yellow-400" : "text-white"
                )}>
                    {rankNum}
                </span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative pt-12 pb-8 mb-4 max-w-2xl mx-auto">
        <div className="absolute inset-0 top-20 bg-gradient-to-b from-[var(--sb-bg)] to-transparent z-10 pointer-events-none" />
        <div className="flex items-end justify-center gap-1 md:gap-3 px-4 relative z-20">
            {renderStep(rank2, "left", 2)}
            {renderStep(rank1, "center", 1)}
            {renderStep(rank3, "right", 3)}
        </div>
    </div>
  );
}
