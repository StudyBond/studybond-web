"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trophy, Target, Timer as TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ExamResult } from "@/lib/api/types";

type ScoreSummaryProps = {
  result: ExamResult;
};

// Animated circular progress
function ScoreRing({ percentage }: { percentage: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Animate from 0 to percentage over 1 second
    const duration = 1000;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    const increment = percentage / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        clearInterval(timer);
        setValue(percentage);
      } else {
        setValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [percentage]);

  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // Color determination based on score
  const isExcellent = value >= 75;
  const isGood = value >= 50 && value < 75;
  const colorClass = isExcellent 
    ? "text-emerald-400" 
    : isGood 
      ? "text-amber-400" 
      : "text-red-400";

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background track */}
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/[0.04]"
        />
        {/* Animated progress */}
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] duration-75 ease-out", colorClass)}
        />
      </svg>
      {/* Percentage Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("sb-mono text-3xl font-bold tracking-tighter", colorClass)}>
          {Math.round(value)}<span className="text-xl">%</span>
        </span>
      </div>
      
      {/* Outer ambient glow if excellent */}
      {isExcellent && (
         <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl scale-75 -z-10 animate-pulse" />
      )}
    </div>
  );
}

export function ScoreSummary({ result }: ScoreSummaryProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#e09040]/15 bg-gradient-to-br from-[#e09040]/10 to-transparent p-6 md:p-10 shadow-2xl">
      {/* Background effects */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[var(--sb-accent)]/[0.08] blur-[80px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left: Score Ring */}
        <div className="flex-shrink-0 animate-in zoom-in duration-700">
          <ScoreRing percentage={result.percentage} />
        </div>

        {/* Right: Metrics */}
        <div className="flex-1 space-y-6 w-full text-center md:text-left">
          <div>
             <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
               Exam Completed
             </h2>
             <p className="text-sm text-white/50">
               {result.displayNameLong}
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {/* Score metric */}
             <div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                   <Target className="h-3.5 w-3.5" /> Score
                </div>
                <span className="sb-mono text-lg font-bold text-white">
                   {result.score} <span className="text-sm text-white/40">/ {result.totalQuestions}</span>
                </span>
             </div>

             {/* Time taken */}
             <div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                   <TimerIcon className="h-3.5 w-3.5" /> Time
                </div>
                <span className="sb-mono text-lg font-bold text-white">
                   {formatTime(result.timeTakenSeconds)}
                </span>
             </div>

             {/* SP Earned */}
             <div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-[var(--sb-accent)]/10 border border-[var(--sb-accent)]/20 shadow-[0_0_15px_var(--sb-accent-glow)]">
                <div className="flex items-center gap-1.5 text-[var(--sb-accent)] text-xs font-semibold uppercase tracking-wider mb-1">
                   <Trophy className="h-3.5 w-3.5" /> SP
                </div>
                <span className="sb-mono text-lg font-bold text-[var(--sb-accent)] flex items-baseline gap-1">
                   +{result.spEarned}
                   {result.spMultiplier > 1 && (
                      <span className="text-[10px] text-white/50 ml-1">({result.spMultiplier}x mult)</span>
                   )}
                </span>
             </div>

             {/* Current Streak */}
             <div className="flex flex-col items-center md:items-start p-3 rounded-2xl bg-orange-400/10 border border-orange-400/20">
                <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">
                   <Sparkles className="h-3.5 w-3.5" /> Streak
                </div>
                <span className="sb-mono text-lg font-bold text-orange-400">
                   {result.stats.currentStreak} Days
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
