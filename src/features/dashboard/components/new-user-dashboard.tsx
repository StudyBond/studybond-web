"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getSavedAvatarId } from "@/lib/avatars/avatar-collection";
import type { UserProfile, UserStats, StreakSummary } from "@/lib/api/types";
import {
  Zap,
  Flame,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";
import type { Route } from "next";
import { useState } from "react";

type NewUserDashboardProps = {
  profile: UserProfile;
  stats: UserStats;
  streak: StreakSummary;
};

/* ─── Journey Step Card ─── */

const journeySteps = [
  {
    step: 1,
    icon: <BookOpen className="h-5 w-5" />,
    title: "Take Exams",
    description: "Practice with real Post-UTME past questions from your institution",
    color: "text-[#e09040]",
    bg: "bg-[#e09040]/10",
    borderColor: "border-[#e09040]/20",
  },
  {
    step: 2,
    icon: <Flame className="h-5 w-5" />,
    title: "Build Streaks",
    description: "Study daily. Every day you practice extends your streak and earns SP",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
  },
  {
    step: 3,
    icon: <Trophy className="h-5 w-5" />,
    title: "Climb Ranks",
    description: "Compete with students at your institution and dominate the leaderboard",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20",
  },
];

/* ─── Premium Feature Peek ─── */

const premiumPeeks = [
  { icon: <TrendingUp className="h-4 w-4" />, label: "Advanced Analytics", color: "text-blue-400" },
  { icon: <Flame className="h-4 w-4" />, label: "Streak Heatmaps", color: "text-orange-400" },
  { icon: <Star className="h-4 w-4" />, label: "Achievement Badges", color: "text-yellow-400" },
  { icon: <Target className="h-4 w-4" />, label: "1v1 Duels", color: "text-purple-400" },
];

export function NewUserDashboard({
  profile,
  stats,
}: NewUserDashboardProps) {
  const firstName = profile?.fullName.split(" ")[0] ?? "Student";
  const [avatarId] = useState(getSavedAvatarId());

  return (
    <>
      {/* ── Hero Welcome Card ── */}
      <section className="sb-enter relative w-full overflow-hidden rounded-3xl border border-white/[0.06]">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 sb-mesh-gradient">
          <div className="absolute inset-0" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e11] via-[#09090b]/95 to-[#12100d]" />

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-[250px] sm:h-[350px] w-[250px] sm:w-[350px] rounded-full bg-[#8b4f1a]/[0.10] blur-[100px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-[200px] sm:h-[300px] w-[200px] sm:w-[300px] rounded-full bg-emerald-700/[0.04] blur-[80px]" />
        <div className="pointer-events-none absolute left-1/3 -bottom-20 h-[180px] sm:h-[250px] w-[180px] sm:w-[250px] rounded-full bg-amber-700/[0.03] blur-[60px]" />

        <div className="relative z-10 p-4 sm:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Welcome */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-5">
                <UserAvatar avatarId={avatarId} size="lg" isPremium={false} showRing />
                <div>
                  <Badge tone="accent" dot>New Explorer</Badge>
                  <p className="text-[10px] text-white/25 mt-1 uppercase tracking-widest">
                    {stats.institution.name}
                  </p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3">
                Welcome to StudyBond,{" "}
                <span className="text-[var(--sb-accent)]">{firstName}</span>
              </h1>

              <p className="max-w-lg text-xs sm:text-sm text-white/40 leading-relaxed mb-5 sm:mb-8">
                Your Post-UTME journey starts with a single exam. Take your first practice test to establish your baseline, start earning Study Points, and ignite your study streak.
              </p>

              {/* Giant CTA */}
              <Button
                asChild
                size="lg"
                className="shadow-[0_2px_24px_var(--sb-accent-glow)] border-t border-[var(--sb-accent)]/30 bg-gradient-to-r from-[var(--sb-accent)] via-[#a06520] to-[#7a4a14] rounded-xl sb-glow-pulse"
                href={"/exams/new?mode=REAL_PAST_QUESTION&step=2" as Route}
              >
                <div className="flex items-center px-4 sm:px-6 py-1 font-bold text-sm sm:text-base text-white">
                  Take Your First Exam
                  <Zap className="ml-2.5 h-5 w-5 fill-current" />
                </div>
              </Button>
            </div>

            {/* Right: Quick Stats Preview */}
            <div className="hidden lg:flex flex-col gap-3 shrink-0 w-56">
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Zap className="h-4 w-4 text-[var(--sb-accent)]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Study Points</span>
                </div>
                <p className="font-mono text-4xl font-bold text-white/20 tracking-tighter">0</p>
                <p className="text-[10px] text-white/20 mt-1">Take an exam to start earning</p>
              </div>
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Flame className="h-4 w-4 text-[var(--sb-streak)]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Streak</span>
                </div>
                <p className="font-mono text-4xl font-bold text-white/20 tracking-tighter">0</p>
                <p className="text-[10px] text-white/20 mt-1">Study daily to build it</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works — Journey Steps ── */}
      <section className="sb-enter mt-5 sm:mt-8 sb-stagger-1">
        <div className="flex items-center gap-2 mb-5 px-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]">
            <Target className="h-3.5 w-3.5 text-white/40" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            How It Works
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {journeySteps.map((step) => (
            <div
              key={step.step}
              className={`group relative overflow-hidden rounded-2xl border ${step.borderColor} bg-[var(--sb-bg-surface-1)] p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--sb-bg-surface-2)]`}
            >
              {/* Step number */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.bg} ${step.color} transition-transform duration-300 group-hover:scale-110`}>
                  {step.icon}
                </div>
                <span className="font-mono text-xs font-bold text-white/15">
                  0{step.step}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
              <p className="text-[12px] text-white/35 leading-relaxed">{step.description}</p>

              {/* Connecting line to next step (not on last) */}
              {step.step < 3 ? (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-20">
                  <ArrowRight className="h-4 w-4 text-white/10" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ── Daily Tip Card ── */}
      <section className="sb-enter mt-5 sm:mt-8 sb-stagger-2">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-r from-emerald-400/[0.04] to-transparent p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Pro Tip</h3>
              <p className="text-[12px] text-white/40 leading-relaxed">
                Students who take at least one exam per day score <span className="text-emerald-400 font-semibold">34% higher</span> on their Post-UTME than those who cram. Start with short sessions — even 10 questions a day makes a difference.
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-emerald-400/[0.06] blur-[40px]" />
        </div>
      </section>

      {/* ── Premium Feature Exploration ── */}
      <section className="sb-enter mt-5 sm:mt-8 sb-stagger-3">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--sb-gold)]/10 bg-gradient-to-br from-[#14120d] via-[#09090b] to-[#0d0b14] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-semibold sb-gradient-text-gold">
              Available with Premium
            </span>
          </div>

          <p className="text-sm text-white/40 leading-relaxed mb-5 max-w-md">
            Unlock advanced tools designed for serious students. Premium members get deeper analytics, achievement tracking, and competitive features.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {premiumPeeks.map((peek) => (
              <div
                key={peek.label}
                className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-center transition-all duration-200 hover:bg-white/[0.04]"
              >
                <div className={`flex items-center justify-center mb-2 ${peek.color}`}>
                  {peek.icon}
                </div>
                <span className="text-[10px] font-semibold text-white/50">{peek.label}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto rounded-xl border-yellow-400/15 bg-yellow-400/[0.06] text-yellow-400/80 hover:bg-yellow-400/[0.10] hover:text-yellow-400"
            href="https://wa.link/cmo8uj"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Explore Premium
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Button>

          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-yellow-400/[0.05] blur-[50px]" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-purple-400/[0.03] blur-[60px]" />
        </div>
      </section>
    </>
  );
}
