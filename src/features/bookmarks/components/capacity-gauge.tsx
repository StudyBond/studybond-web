"use client";

import { cn } from "@/lib/utils/cn";
import type { BookmarkLimits } from "@/lib/api/types";
import { Crown, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

type CapacityGaugeProps = {
  limits: BookmarkLimits;
};

export function CapacityGauge({ limits }: CapacityGaugeProps) {
  const { activeBookmarks, maxBookmarks, remainingBookmarks, expiryDays, accessTier } = limits;
  const percentage = maxBookmarks > 0 ? (activeBookmarks / maxBookmarks) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Outer ring (dashed ticks)
  const outerRadius = 45;
  const outerCircumference = 2 * Math.PI * outerRadius;

  // Inner progress ring
  const innerRadius = 38;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = innerCircumference - (clampedPercentage / 100) * innerCircumference;

  // Premium / High-capacity color schemes
  const color =
    clampedPercentage >= 90
      ? { stroke: "var(--sb-danger)", glow: "var(--sb-danger-soft)", text: "text-red-400" }
      : clampedPercentage >= 70
        ? { stroke: "#fbbf24", glow: "rgba(251, 191, 36, 0.15)", text: "text-amber-400" }
        : accessTier === "PREMIUM"
          ? { stroke: "var(--sb-gold)", glow: "var(--sb-gold-glow)", text: "text-[var(--sb-gold)]" }
          : { stroke: "var(--sb-accent)", glow: "var(--sb-accent-glow)", text: "text-[var(--sb-accent-text)]" };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 shadow-[var(--sb-shadow-sm)] backdrop-blur-md transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.02]">
      {/* Decorative background grid line */}
      <div className="absolute inset-0 bg-grid opacity-[0.1] pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Compass Dial */}
        <div className="relative shrink-0 select-none">
          <svg width="112" height="112" viewBox="0 0 100 100" className="-rotate-90">
            {/* Outer Compass Compass Rose Ticks */}
            <circle
              cx="50"
              cy="50"
              r={outerRadius}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1.5"
              strokeDasharray="2 3"
            />
            {/* Outer track accent circles */}
            <circle
              cx="50"
              cy="50"
              r={outerRadius - 3}
              fill="none"
              stroke="rgba(255,255,255,0.015)"
              strokeWidth="0.5"
            />

            {/* Inner track backing */}
            <circle
              cx="50"
              cy="50"
              r={innerRadius}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="4"
            />

            {/* Inner progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r={innerRadius}
              fill="none"
              stroke={color.stroke}
              strokeWidth="4.5"
              strokeLinecap="round"
              initial={{ strokeDashoffset: innerCircumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                strokeDasharray: innerCircumference,
                filter: `drop-shadow(0 0 6px ${color.glow})`,
              }}
            />
          </svg>

          {/* Compass Needle Ornament */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[84px] h-[84px] rounded-full border border-white/[0.02] flex items-center justify-center animate-[sb-spin_40s_linear_infinite]">
              <div className="absolute top-0 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[var(--sb-accent)]/20" />
              <div className="absolute bottom-0 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[var(--sb-accent)]/20" />
            </div>
          </div>

          {/* Center ratio text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-text">
            <span className={cn("text-xl font-bold tracking-tight sb-mono", color.text)}>
              {activeBookmarks}
            </span>
            <div className="h-px w-6 bg-white/10 my-0.5" />
            <span className="text-[9px] font-semibold text-white/20 tracking-wider uppercase">{maxBookmarks} max</span>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-sm font-semibold text-white/85 tracking-wide">Saved Questions</h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all",
                accessTier === "PREMIUM"
                  ? "bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] border border-[var(--sb-gold)]/20 shadow-[0_0_10px_var(--sb-gold-glow)]"
                  : "bg-white/[0.04] text-white/40 border border-white/[0.05]",
              )}
            >
              {accessTier === "PREMIUM" && <Crown className="h-2.5 w-2.5" />}
              {accessTier === "PREMIUM" ? "Premium" : "Free"}
            </span>
          </div>

          <p className="text-xs text-white/40 leading-relaxed font-medium">
            {remainingBookmarks > 0 ? (
              <span>
                You have <span className="text-white/70 font-semibold">{remainingBookmarks}</span> open slots left.
              </span>
            ) : (
              <span className="text-red-400/80 font-semibold">Your capacity is full. Remove older questions to save new ones.</span>
            )}
            <span className="mx-1.5 opacity-30">·</span>
            <span>Saved items are kept for {expiryDays} days.</span>
          </p>

          {/* Promotion / Action Banner */}
          {accessTier === "FREE" ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--sb-gold)]/[0.08] to-transparent border border-[var(--sb-gold)]/10 px-3 py-2 text-left">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--sb-gold)]/10 text-[var(--sb-gold)]">
                <Crown className="h-3 w-3" />
              </div>
              <p className="text-[10px] text-[var(--sb-gold)]/80 font-medium">
                Upgrade to Premium to save up to <span className="font-bold">50 questions</span> with no expiration date.
              </p>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[10px] text-white/30 font-medium">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Premium accounts enjoy larger capacity and permanent questions saving.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
