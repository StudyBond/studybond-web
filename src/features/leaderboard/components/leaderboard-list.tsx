"use client";

import { cn } from "@/lib/utils/cn";
import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/api/types";

type LeaderboardListProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardList({ entries }: LeaderboardListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-1 md:space-y-2 pb-32">
      {entries.map((entry, index) => {
        const isCurrentUser = entry.isCurrentUser;
        
        return (
          <div
            key={entry.userId}
            className={cn(
              "flex items-center gap-4 rounded-2xl px-4 py-3 md:py-4 transition-colors animate-in fade-in slide-in-from-bottom-4",
              isCurrentUser
                ? "bg-[var(--sb-accent)]/10 border border-[var(--sb-accent)]/20 shadow-[0_4px_24px_rgba(224,144,64,0.15)] relative z-10"
                : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]",
            )}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
          >
            {/* Rank Number */}
            <div className="w-8 shrink-0 text-center font-bold text-white/40 font-mono">
              #{entry.rank}
            </div>

            {/* Avatar Placeholder */}
            <div className={cn(
               "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-inner",
               isCurrentUser ? "bg-[var(--sb-accent)] text-white" : "bg-white/10 text-white/50"
            )}>
               {entry.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
               <div className={cn(
                  "truncate font-bold tracking-tight text-white",
                  isCurrentUser ? "text-[var(--sb-accent)]" : "text-white/90"
               )}>
                  {entry.fullName}
               </div>
               {isCurrentUser && (
                  <div className="text-[10px] font-bold uppercase text-[var(--sb-accent)]/80">You</div>
               )}
            </div>

            {/* Points */}
            <div className="flex items-center gap-1.5 sb-mono font-bold text-emerald-400">
               {entry.points.toLocaleString()}
               <span className="text-[10px] text-white/30 hidden sm:inline">SP</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
