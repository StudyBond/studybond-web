"use client";

import { Bookmark, Zap, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";

export function BookmarkEmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center overflow-hidden rounded-3xl border border-white/[0.03] bg-white/[0.005]">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--sb-accent)]/[0.02] blur-3xl pointer-events-none" />
      
      {/* Intricate SVG Vault Door Illustration */}
      <div className="relative w-36 h-36 mb-8 flex items-center justify-center select-none">
        {/* Background glow ring */}
        <div className="absolute inset-0 rounded-full bg-[var(--sb-accent)]/[0.04] blur-xl animate-pulse" />
        
        {/* Outer compass ring */}
        <div className="absolute inset-0 rounded-full border border-[var(--sb-accent)]/10 border-dashed animate-[sb-spin_80s_linear_infinite]" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--sb-accent)]/20 drop-shadow-[0_0_15px_rgba(193,122,40,0.15)]">
          {/* Main Vault Outer Ring */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 1" />
          
          {/* Rivets around vault door */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 50 + 40 * Math.cos(angle);
            const cy = 50 + 40 * Math.sin(angle);
            return <circle key={i} cx={cx} cy={cy} r="1.5" fill="currentColor" opacity="0.6" />;
          })}
          
          {/* Vault Locking Bars (Spokes) */}
          <g className="origin-center animate-[sb-spin_120s_linear_infinite]">
            <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="1" strokeDasharray="40 20 40" />
            <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="40 20 40" />
            <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="0.75" />
            <line x1="20" y1="80" x2="80" y2="20" stroke="currentColor" strokeWidth="0.75" />
          </g>

          {/* Inner Gear */}
          <circle cx="50" cy="50" r="22" fill="rgba(12,12,14,0.9)" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Center glowing lock */}
          <circle cx="50" cy="50" r="14" fill="rgba(193,122,40,0.08)" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* Floating Core Bookmark Icon inside vault */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#18181b] to-[#0c0c0e] border border-[var(--sb-accent)]/30 text-[var(--sb-accent)] shadow-[0_4px_20px_var(--sb-accent-glow)]"
          >
            <Bookmark className="h-5 w-5 fill-current" />
          </motion.div>
        </div>
      </div>

      {/* Text Copy */}
      <h3 className="text-lg font-semibold text-white/80 tracking-wide mb-2">Vault is Sealed</h3>
      <p className="text-xs text-white/30 max-w-sm leading-relaxed mb-8">
        Your Study Vault is currently empty. Bookmark challenging questions during practice exams to build a personalized arsenal of weak spots.
      </p>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href={"/dashboard/practice" as Route}
          className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--sb-accent)] via-[#b56e20] to-[#c17a28] border border-[var(--sb-accent)]/30 shadow-[0_2px_16px_var(--sb-accent-glow)] hover:shadow-[0_4px_24px_var(--sb-accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Zap className="h-4 w-4 fill-current" />
          Begin Practice Exam
        </Link>
      </div>

      {/* Guide details */}
      <div className="mt-10 flex items-start gap-2.5 rounded-xl border border-white/[0.02] bg-white/[0.005] px-4 py-3 max-w-md text-left">
        <HelpCircle className="h-4 w-4 text-white/20 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-white/55 uppercase tracking-wide">How it works</p>
          <p className="text-[10px] text-white/25 leading-normal">
            When reviewing any completed exam, click the bookmark icon on any question. It gets saved here automatically with options to attach custom notes, study solutions, or take customized exams targeting only your saved list.
          </p>
        </div>
      </div>
    </div>
  );
}

