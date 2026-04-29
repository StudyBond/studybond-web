"use client";

import { cn } from "@/lib/utils/cn";
import type { BookmarkLimits } from "@/lib/api/types";
import { Crown } from "lucide-react";

type CapacityGaugeProps = {
  limits: BookmarkLimits;
};

export function CapacityGauge({ limits }: CapacityGaugeProps) {
  const { activeBookmarks, maxBookmarks, remainingBookmarks, expiryDays, accessTier } = limits;
  const percentage = maxBookmarks > 0 ? (activeBookmarks / maxBookmarks) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Circumference math for the SVG ring
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Color based on capacity
  const color =
    clampedPercentage >= 85
      ? { stroke: "#f87171", glow: "rgba(248, 113, 113, 0.25)", text: "text-red-400" }
      : clampedPercentage >= 60
        ? { stroke: "#fbbf24", glow: "rgba(251, 191, 36, 0.25)", text: "text-amber-400" }
        : { stroke: "#4ade80", glow: "rgba(74, 222, 128, 0.25)", text: "text-emerald-400" };

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5">
      {/* SVG Ring */}
      <div className="relative shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color.glow})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-black tracking-tight", color.text)}>
            {activeBookmarks}
          </span>
          <span className="text-[9px] font-semibold text-white/20">/ {maxBookmarks}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white/80">Bookmark Capacity</h3>
          <span
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
              accessTier === "PREMIUM"
                ? "bg-[var(--sb-gold)]/10 text-[var(--sb-gold)]"
                : "bg-white/[0.04] text-white/25",
            )}
          >
            {accessTier === "PREMIUM" && <Crown className="h-2 w-2" />}
            {accessTier === "PREMIUM" ? "Elite" : "Free"}
          </span>
        </div>

        <p className="text-xs text-white/30 leading-relaxed">
          {remainingBookmarks > 0
            ? `${remainingBookmarks} slot${remainingBookmarks === 1 ? "" : "s"} remaining`
            : "You've reached your limit"}
          {" · "}
          Bookmarks expire after {expiryDays} days
        </p>

        {/* Capacity warning */}
        {clampedPercentage >= 85 && accessTier === "FREE" && (
          <p className="text-[10px] text-amber-400/60 bg-amber-400/[0.04] rounded-lg px-2.5 py-1.5 mt-1">
            Almost full! Upgrade to Elite for 50 bookmark slots.
          </p>
        )}
      </div>
    </div>
  );
}
