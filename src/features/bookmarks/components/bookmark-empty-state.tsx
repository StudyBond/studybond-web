"use client";

import { Bookmark, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

export function BookmarkEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon with ambient glow */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--sb-accent)]/[0.06] border border-[var(--sb-accent)]/[0.08]">
          <Bookmark className="h-9 w-9 text-[var(--sb-accent)]/40" />
        </div>
        {/* Ambient pulse rings */}
        <div className="absolute inset-0 rounded-3xl bg-[var(--sb-accent)]/[0.04] animate-ping opacity-30" />
        <div className="absolute -inset-3 rounded-3xl bg-[var(--sb-accent)]/[0.02] blur-xl" />
      </div>

      <h3 className="text-lg font-bold text-white/70 mb-2">Your Study Vault is Empty</h3>
      <p className="text-sm text-white/25 max-w-xs leading-relaxed mb-6">
        Bookmark questions during exam review to build your personal collection of study material.
      </p>

      {/* CTA */}
      <Link
        href={"/dashboard/practice" as Route}
        className="group flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[var(--sb-accent)] via-[#a06520] to-[#7a4a14] shadow-[0_2px_20px_var(--sb-accent-glow)] hover:shadow-[0_4px_30px_var(--sb-accent-glow)] hover:scale-[1.02] transition-all duration-300"
      >
        <Zap className="h-4 w-4 fill-current" />
        Take an Exam
      </Link>

      {/* Subtle hint */}
      <div className="flex items-center gap-2 mt-8 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
        <BookOpen className="h-3.5 w-3.5 text-white/15" />
        <p className="text-[10px] text-white/15">
          Look for the <Bookmark className="inline h-3 w-3 text-[var(--sb-accent)]/30" /> icon in your exam results
        </p>
      </div>
    </div>
  );
}
