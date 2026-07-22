"use client";

import { Crown, Sparkles, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type StudyPremiumWallProps = {
  onBackToDashboard: () => void;
};

const FEATURE_COMPARISON = [
  { feature: "Question Pool", free: "3 Free Exam Sample Qs", premium: "10,000+ Real Past & Practice Qs" },
  { feature: "Real Exam Questions", free: false, premium: true },
  { feature: "Unlimited Subject Practice", free: false, premium: true },
  { feature: "Detailed Explanations", free: "Sample Only", premium: "Every Single Question" },
  { feature: "Topic Blueprint Mastery", free: false, premium: true },
  { feature: "1v1 Duels & Multiplayer", free: false, premium: true },
];

export function StudyPremiumWall({ onBackToDashboard }: StudyPremiumWallProps) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="relative max-w-xl w-full overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-indigo-950/40 via-black/90 to-black p-6 sm:p-8 backdrop-blur-2xl text-center shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        {/* Glow Effects */}
        <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-amber-500/15 blur-[60px]" />
        <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-indigo-500/15 blur-[60px]" />

        {/* Premium Icon Header */}
        <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-[#e09040] shadow-[0_0_35px_rgba(245,158,11,0.3)]">
          <Crown className="h-8 w-8 text-black" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Unlock the Real Past Question Bank
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mb-6 max-w-md mx-auto">
          You've completed your 3 free questions sample. Upgrade to <span className="text-amber-400 font-bold">StudyBond Premium</span> to study actual UTME, WAEC & JAMB questions with complete explanations.
        </p>

        {/* Feature Comparison Table */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden text-left text-xs">
          <div className="grid grid-cols-12 bg-white/[0.04] p-3 font-bold border-b border-white/[0.06] text-white/50 text-[10px] uppercase tracking-wider">
            <div className="col-span-6">Feature</div>
            <div className="col-span-3 text-center">Free Pool</div>
            <div className="col-span-3 text-center text-amber-400">Premium</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {FEATURE_COMPARISON.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 p-3 items-center text-white/80">
                <div className="col-span-6 font-medium text-white/90">{row.feature}</div>
                <div className="col-span-3 text-center text-white/40">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-white/20 mx-auto" />
                    )
                  ) : (
                    <span className="text-[11px] font-mono">{row.free}</span>
                  )}
                </div>
                <div className="col-span-3 text-center font-bold text-amber-300">
                  {typeof row.premium === "boolean" ? (
                    row.premium ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto stroke-[3]" />
                    ) : (
                      <X className="h-4 w-4 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-[11px] font-mono">{row.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/settings" className="w-full">
            <Button className="w-full h-12 bg-gradient-to-r from-amber-400 via-amber-500 to-[#e09040] hover:from-amber-500 hover:to-[#d08030] text-black font-bold text-base rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all scale-[1.01] hover:scale-[1.02]">
              Upgrade to Premium Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={onBackToDashboard}
            className="w-full h-10 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-5 text-[10px] uppercase tracking-widest text-white/30 font-bold">
          🔥 Join 4,200+ top candidates mastering questions on Premium
        </div>
      </div>
    </div>
  );
}

