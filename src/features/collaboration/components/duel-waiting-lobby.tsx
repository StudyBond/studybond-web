"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Timer, Trophy, Target, Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type DuelWaitingLobbyProps = {
  opponentName: string;
  opponentProgress: { current: number; total: number } | null;
  opponentFinished: boolean;
  /** The user's own result stats to show while waiting */
  myScore?: number;
  myTotalQuestions?: number;
  myTimeTaken?: number;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function getStatusText(
  opponentName: string,
  progress: { current: number; total: number } | null,
  finished: boolean,
) {
  if (finished) return "Both papers are in. Tallying scores and rankings...";
  if (!progress) return `Waiting for ${opponentName} to finish their paper...`;
  const pct = Math.round((progress.current / progress.total) * 100);
  if (pct >= 90) return `Almost there... ${opponentName} is on the final stretch.`;
  if (pct >= 60) return `${opponentName} is pushing through — Q${progress.current}/${progress.total}.`;
  if (pct >= 30) return `${opponentName} is working — Q${progress.current}/${progress.total}. You finished faster.`;
  return `${opponentName} is on Q${progress.current}/${progress.total}... you already submitted.`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function DuelWaitingLobby({
  opponentName,
  opponentProgress,
  opponentFinished,
  myScore,
  myTotalQuestions,
  myTimeTaken,
}: DuelWaitingLobbyProps) {
  const [dots, setDots] = useState("");
  const statusText = useMemo(
    () => getStatusText(opponentName, opponentProgress, opponentFinished),
    [opponentName, opponentProgress, opponentFinished],
  );

  // Animated ellipsis
  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const progressPct = opponentProgress
    ? Math.min(100, Math.max(0, (opponentProgress.current / opponentProgress.total) * 100))
    : 0;

  // Progress ring constants
  const ringSize = 140;
  const r = 58;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--sb-bg)] px-4">
      {/* Ambient pulsing background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.06] sb-duel-anticipation-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-red-500/[0.03] sb-duel-anticipation-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 fade-in duration-500">
        {/* Status header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.04] shadow-2xl shadow-black/50 border border-white/[0.08]">
            {opponentFinished ? (
              <Trophy className="h-7 w-7 text-amber-500 animate-in zoom-in-50 duration-500" />
            ) : (
              <Timer className="h-7 w-7 text-amber-500 animate-pulse" />
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            {opponentFinished ? "Calculating Results" : "Opponent Still Writing"}
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-[340px] mx-auto">
            {statusText}
          </p>
        </div>

        {/* Split layout: Opponent progress + Your stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Opponent Card */}
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-400/10 font-bold text-sm text-white shadow-inner shadow-white/10">
                {getInitials(opponentName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{opponentName}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/50">Rival</p>
              </div>
              {opponentFinished ? (
                <Badge tone="success">Done</Badge>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-bold">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Live
                </div>
              )}
            </div>

            {/* Progress ring */}
            <div className="flex justify-center">
              <div className="relative" style={{ width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} className="transform -rotate-90">
                  <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/[0.04]" />
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={r}
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={opponentFinished ? 0 : offset}
                    strokeLinecap="round"
                    className={cn(
                      "transition-[stroke-dashoffset] duration-700 ease-out",
                      opponentFinished ? "text-emerald-400" : "text-amber-400",
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {opponentFinished ? (
                    <Trophy className="h-8 w-8 text-emerald-400 sb-duel-slot-spin" />
                  ) : opponentProgress ? (
                    <>
                      <span className="sb-mono text-2xl font-black text-white">{opponentProgress.current}</span>
                      <span className="text-[10px] text-white/30 font-semibold">/ {opponentProgress.total}</span>
                    </>
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My Stats Preview Card */}
          <div className="rounded-[24px] border border-amber-500/10 bg-amber-500/[0.03] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-400" />
              <p className="text-sm font-bold text-white/80">Your Performance</p>
            </div>

            <div className="space-y-3">
              {myScore != null && myTotalQuestions != null && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Target className="h-3.5 w-3.5" /> Score
                  </span>
                  <span className="sb-mono text-lg font-black text-white">
                    {myScore}<span className="text-white/30 text-sm">/{myTotalQuestions}</span>
                  </span>
                </div>
              )}

              {myScore != null && myTotalQuestions != null && myTotalQuestions > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Zap className="h-3.5 w-3.5" /> Accuracy
                  </span>
                  <span className="sb-mono text-lg font-bold text-amber-400">
                    {Math.round((myScore / myTotalQuestions) * 100)}%
                  </span>
                </div>
              )}

              {myTimeTaken != null && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Clock className="h-3.5 w-3.5" /> Time
                  </span>
                  <span className="sb-mono text-sm font-bold text-white/70">
                    {formatTime(myTimeTaken)}
                  </span>
                </div>
              )}
            </div>

            {/* Anticipation message */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-amber-400/60 font-medium">
                {opponentFinished
                  ? "Results incoming — brace yourself!"
                  : `You finished first${dots}`}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom calculating indicator */}
        {opponentFinished && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 py-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              Calculating rankings &amp; preparing the reveal...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
