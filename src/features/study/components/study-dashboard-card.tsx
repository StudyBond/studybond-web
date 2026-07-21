"use client";

import { Crown, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type StudyDashboardCardProps = {
  isPremium?: boolean;
};

export function StudyDashboardCard({ isPremium = false }: StudyDashboardCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/10 bg-gradient-to-r from-indigo-500/[0.03] to-transparent p-5">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-indigo-500/[0.05] blur-[30px]" />

      <div className="flex items-start gap-3.5">
        {/* Left icon wrapper */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.1)]">
          <BookOpen className="h-5 w-5" />
        </div>

        {/* Card details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-sm font-bold text-white/90">Self-Paced Study Mode</h3>
            {isPremium ? (
              <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                Premium Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                <Crown className="h-2 w-2" />
                Free Teaser
              </span>
            )}
          </div>

          <p className="text-[12px] text-white/45 leading-relaxed mb-4">
            Learn at your own pace with instant answer checks and deep tutor explanations. No countdown timer, no pressure, just understanding.
          </p>

          <div className="flex items-center gap-3">
            <Link href={"/dashboard/study" as any}>
              <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-1.5">
                Start Studying
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>

            {!isPremium && (
              <span className="text-[10px] text-white/30 font-medium">
                Try 3 free questions per session
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default StudyDashboardCard;
