"use client";

import { Crown, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type StudyPremiumWallProps = {
  onBackToDashboard: () => void;
};

const BENEFITS = [
  "Unlimited questions across all years",
  "Full subject coverage — Mathematics, English, Physics, Chem, Bio",
  "Instant tutor explanations for every single question",
  "Detailed topic-by-topic mastery tracking",
  "1v1 Multiplayer Duels & Daily Challenges",
];

export function StudyPremiumWall({ onBackToDashboard }: StudyPremiumWallProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-indigo-950/20 to-black/80 p-8 backdrop-blur-2xl text-center">
        {/* Glow Effects */}
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[var(--sb-study-accent)]/15 blur-[50px]" />
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-[50px]" />

        {/* Premium Icon Header */}
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-[#e09040] shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <Crown className="h-8 w-8 text-black" />
          {/* Sparkles */}
          <Sparkles className="absolute -top-1.5 -right-1.5 h-5 w-5 text-yellow-300 animate-pulse" />
        </div>

        {/* Headline */}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
          Unlock the Full Study Mode
        </h2>
        <p className="text-sm text-white/50 mb-6 px-4">
          You've completed your 3 free questions teaser. Upgrade to StudyBond Premium to unlock unlimited learning.
        </p>

        {/* Benefits Checklist */}
        <div className="text-left space-y-3 mb-8 bg-white/[0.02] border border-white/[0.04] p-5 rounded-2xl">
          {BENEFITS.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-white/70">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/settings" className="w-full">
            <Button className="w-full h-11 bg-gradient-to-r from-amber-400 to-[#e09040] hover:from-amber-500 hover:to-[#d08030] text-black font-bold rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2">
              Upgrade to Premium
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={onBackToDashboard}
            className="w-full h-11 text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
          >
            Maybe Later, Back to Dashboard
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-6 text-[10px] uppercase tracking-widest text-white/20 font-bold">
          🔥 Join 4,200+ candidates study-grinding on Premium
        </div>
      </div>
    </div>
  );
}
