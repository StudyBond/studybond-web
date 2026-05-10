"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Swords, Share2, RefreshCcw, ArrowLeft, Zap, Target, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ExamResult, CollaborationSessionSnapshot } from "@/lib/api/types";
import { AnswerReview } from "@/features/exam/components/answer-review";
import { AnimatedCounter } from "@/features/collaboration/components/animated-counter";
import { DuelConfetti } from "@/features/collaboration/components/duel-confetti";
import {
  playScoreTick,
  playVictoryFanfare,
  playDefeatSound,
  playDrawSound,
  playCrownDrop,
  playConfettiBurst,
  playVsClash,
  playRevealWhoosh,
} from "@/features/collaboration/lib/duel-sounds";
import { cn } from "@/lib/utils/cn";

// ─── Types ───

type DuelResultsPageProps = {
  result: ExamResult;
  collabSession: CollaborationSessionSnapshot["session"];
  myUserId: number;
};

type RevealPhase = "entrance" | "cards" | "winner" | "stats";

// ─── Helpers ───

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ─── Score Ring Sub-component ───

function DuelScoreRing({
  percentage,
  isWinner,
  active,
  delay = 0,
  size = 120,
}: {
  percentage: number;
  isWinner: boolean;
  active: boolean;
  delay?: number;
  size?: number;
}) {
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={center} cy={center} r={r} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/[0.06]" />
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={active ? offset : circumference}
          strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] ease-out", isWinner ? "text-amber-400" : "text-white/40")}
          style={{ transitionDuration: "1.5s", transitionDelay: `${delay}ms` }}
        />
      </svg>
      {isWinner && active && (
        <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-xl scale-90 -z-10 animate-pulse" />
      )}
    </div>
  );
}

// ─── Stat Comparison Bar ───

function StatComparisonBar({
  label,
  icon: Icon,
  myValue,
  opponentValue,
  myLabel,
  opponentLabel,
  active,
  delay,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  myValue: number;
  opponentValue: number;
  myLabel: string;
  opponentLabel: string;
  active: boolean;
  delay: number;
}) {
  const total = Math.max(myValue + opponentValue, 1);
  const myPct = (myValue / total) * 100;
  const opPct = (opponentValue / total) * 100;
  const iAmAhead = myValue > opponentValue;

  return (
    <div className="space-y-2 sb-enter" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-white/50">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
      </div>
      <div className="flex gap-1 h-7 rounded-full overflow-hidden bg-white/[0.03]">
        <div
          className={cn(
            "h-full rounded-l-full flex items-center justify-end px-2.5 text-[10px] font-bold transition-all duration-1000 ease-out",
            iAmAhead ? "bg-gradient-to-r from-amber-500/60 to-amber-400/80 text-white" : "bg-white/10 text-white/60",
          )}
          style={{ width: active ? `${Math.max(myPct, 8)}%` : "0%" }}
        >
          {myLabel}
        </div>
        <div
          className={cn(
            "h-full rounded-r-full flex items-center justify-start px-2.5 text-[10px] font-bold transition-all duration-1000 ease-out",
            !iAmAhead && myValue !== opponentValue ? "bg-gradient-to-l from-red-500/50 to-red-400/70 text-white" : "bg-white/10 text-white/60",
          )}
          style={{ width: active ? `${Math.max(opPct, 8)}%` : "0%", transitionDelay: "200ms" }}
        >
          {opponentLabel}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───

export function DuelResultsPage({ result, collabSession, myUserId }: DuelResultsPageProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<RevealPhase>("entrance");
  const [skipped, setSkipped] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const me = collabSession.participants.find((p) => p.userId === myUserId);
  const opponent = collabSession.participants.find((p) => p.userId !== myUserId);

  const didIWin = me?.finalRank === 1 && opponent?.finalRank !== 1;
  const isDraw = me?.score === opponent?.score;
  const myPercentage = Math.round(result.percentage);
  const opponentPercentage = opponent?.score != null ? Math.round((opponent.score / result.totalQuestions) * 100) : 0;

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Phase machine
  useEffect(() => {
    if (prefersReducedMotion || skipped) {
      setPhase("stats");
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Entrance → cards
    timers.push(setTimeout(() => {
      setPhase("cards");
      playVsClash();
    }, 800));

    // Cards → winner
    timers.push(setTimeout(() => {
      setPhase("winner");
      playRevealWhoosh();
      if (isDraw) {
        playDrawSound();
      } else if (didIWin) {
        setTimeout(() => {
          playCrownDrop();
          playVictoryFanfare();
          setConfettiActive(true);
          playConfettiBurst();
        }, 400);
      } else {
        setTimeout(() => playDefeatSound(), 300);
      }
    }, 2400));

    // Winner → stats
    timers.push(setTimeout(() => {
      setPhase("stats");
    }, 4000));

    return () => timers.forEach(clearTimeout);
  }, [prefersReducedMotion, skipped, isDraw, didIWin]);

  const handleSkip = useCallback(() => {
    setSkipped(true);
    setPhase("stats");
  }, []);

  if (!me || !opponent) return null;

  const isRevealed = phase === "cards" || phase === "winner" || phase === "stats";
  const isWinnerPhase = phase === "winner" || phase === "stats";
  const isStatsPhase = phase === "stats";

  const outcomeText = isDraw ? "DRAW" : didIWin ? "VICTORY" : "DEFEAT";
  const outcomeSubtext = isDraw
    ? "A clash of equals — respect earned on both sides."
    : didIWin
      ? "You dominated the arena. The crown is yours."
      : "You fell in battle, but champions always rise again.";

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-6 md:py-10 pb-24">
      {/* Confetti Layer */}
      <DuelConfetti active={confettiActive} count={50} originX={50} originY={15} />

      {/* Skip button during ceremony */}
      {phase !== "stats" && !skipped && (
        <button
          onClick={handleSkip}
          className="fixed top-6 right-6 z-[200] flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-4 py-2 text-xs font-medium text-white/50 hover:text-white/80 hover:border-white/20 transition-all animate-in fade-in duration-500"
          style={{ animationDelay: "1200ms" }}
        >
          Skip
        </button>
      )}

      {/* ═══ ENTRANCE ENERGY PULSE ═══ */}
      {phase === "entrance" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div
            className={cn(
              "h-[300px] w-[300px] rounded-full sb-duel-energy-pulse",
              didIWin || isDraw ? "bg-amber-500/30" : "bg-red-500/20",
            )}
          />
        </div>
      )}

      {/* ═══ OUTCOME HEADER ═══ */}
      <div className="text-center mb-8 md:mb-12 space-y-3 min-h-[120px]">
        {isWinnerPhase && (
          <>
            <h1
              className={cn(
                "text-5xl md:text-7xl font-black uppercase tracking-tight sb-duel-text-reveal",
                isDraw
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500"
                  : didIWin
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600/60",
              )}
            >
              {outcomeText}
            </h1>
            <p className="text-white/40 max-w-md mx-auto text-sm md:text-base sb-enter" style={{ animationDelay: "400ms" }}>
              {outcomeSubtext}
            </p>
          </>
        )}
      </div>

      {/* ═══ HEAD-TO-HEAD ARENA ═══ */}
      <div className="relative">
        {/* Background arena glow */}
        <div className="absolute inset-0 -m-8 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(224,144,64,0.06),transparent_70%)] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* ── MY CARD ── */}
          <div
            className={cn(
              "relative flex-1 w-full max-w-[380px] rounded-[28px] border border-white/[0.08] bg-[#0c0c0f]/90 backdrop-blur-2xl p-6 md:p-8 transition-all duration-700",
              isRevealed ? "sb-duel-slide-left" : "opacity-0",
              isWinnerPhase && didIWin && "sb-duel-winner-glow",
              isWinnerPhase && !didIWin && !isDraw && "sb-duel-defeat",
              isDraw && isWinnerPhase && "sb-duel-draw-shimmer",
            )}
          >
            {/* Winner crown */}
            {isWinnerPhase && didIWin && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 sb-duel-crown-drop">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_20px_rgba(212,161,33,0.4)]">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            {/* "YOU" badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                You
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <DuelScoreRing percentage={myPercentage} isWinner={didIWin} active={isRevealed} delay={600} size={110} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 text-2xl font-bold text-white shadow-inner">
                    {getInitials(me.fullName)}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 truncate max-w-full">{me.fullName}</h3>

              {/* Score */}
              <div className="mt-3 mb-4">
                <AnimatedCounter
                  target={me.score ?? 0}
                  active={isRevealed}
                  delay={800}
                  duration={1400}
                  onTick={playScoreTick}
                  className="sb-mono text-4xl font-black text-white"
                />
                <span className="text-lg text-white/30 ml-1">/ {result.totalQuestions}</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Time</p>
                  <p className="sb-mono text-sm font-bold text-white/80">{formatTime(result.timeTakenSeconds)}</p>
                </div>
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.12] p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/50 mb-0.5">SP</p>
                  <AnimatedCounter
                    target={result.spEarned}
                    active={isRevealed}
                    delay={1200}
                    duration={800}
                    prefix="+"
                    className="sb-mono text-sm font-bold text-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── VS BADGE ── */}
          <div className={cn("shrink-0 relative z-10 my-2 md:my-0", isRevealed ? "sb-duel-vs-clash" : "opacity-0")}>
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150" />
            <div className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-[0_0_40px_rgba(239,68,68,0.3)] border-4 border-[#0a0a0a]">
              <Swords className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
          </div>

          {/* ── OPPONENT CARD ── */}
          <div
            className={cn(
              "relative flex-1 w-full max-w-[380px] rounded-[28px] border border-white/[0.08] bg-[#0c0c0f]/90 backdrop-blur-2xl p-6 md:p-8 transition-all duration-700",
              isRevealed ? "sb-duel-slide-right" : "opacity-0",
              isWinnerPhase && !didIWin && !isDraw && "sb-duel-winner-glow",
              isWinnerPhase && didIWin && "sb-duel-defeat",
              isDraw && isWinnerPhase && "sb-duel-draw-shimmer",
            )}
          >
            {/* Opponent winner crown */}
            {isWinnerPhase && !didIWin && !isDraw && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 sb-duel-crown-drop">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_20px_rgba(212,161,33,0.4)]">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/15 text-[10px] font-bold uppercase tracking-widest text-red-400/70">
                Rival
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <DuelScoreRing percentage={opponentPercentage} isWinner={!didIWin && !isDraw} active={isRevealed} delay={800} size={110} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-2xl font-bold text-white shadow-inner">
                    {getInitials(opponent.fullName)}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 truncate max-w-full">{opponent.fullName}</h3>

              <div className="mt-3 mb-4">
                <AnimatedCounter
                  target={opponent.score ?? 0}
                  active={isRevealed}
                  delay={1000}
                  duration={1400}
                  className="sb-mono text-4xl font-black text-white"
                />
                <span className="text-lg text-white/30 ml-1">/ {result.totalQuestions}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Rank</p>
                  <p className="sb-mono text-sm font-bold text-white/80">#{opponent.finalRank ?? "-"}</p>
                </div>
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.12] p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/50 mb-0.5">SP</p>
                  <AnimatedCounter
                    target={opponent.spEarned ?? 0}
                    active={isRevealed}
                    delay={1400}
                    duration={800}
                    prefix="+"
                    className="sb-mono text-sm font-bold text-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HEAD-TO-HEAD STAT COMPARISON ═══ */}
      {isStatsPhase && (
        <div className="mt-10 rounded-[28px] border border-white/[0.06] bg-[#0c0c0f]/80 backdrop-blur-xl p-6 md:p-8 space-y-5 sb-enter">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Head to Head</h3>
          </div>

          <StatComparisonBar
            label="Score"
            icon={Target}
            myValue={me.score ?? 0}
            opponentValue={opponent.score ?? 0}
            myLabel={`${me.score ?? 0}`}
            opponentLabel={`${opponent.score ?? 0}`}
            active={isStatsPhase}
            delay={100}
          />
          <StatComparisonBar
            label="Accuracy"
            icon={Zap}
            myValue={myPercentage}
            opponentValue={opponentPercentage}
            myLabel={`${myPercentage}%`}
            opponentLabel={`${opponentPercentage}%`}
            active={isStatsPhase}
            delay={200}
          />
          <StatComparisonBar
            label="SP Earned"
            icon={Trophy}
            myValue={result.spEarned}
            opponentValue={opponent.spEarned ?? 0}
            myLabel={`+${result.spEarned}`}
            opponentLabel={`+${opponent.spEarned ?? 0}`}
            active={isStatsPhase}
            delay={300}
          />

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400/60" /> You</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/20" /> Opponent</span>
          </div>
        </div>
      )}

      {/* ═══ ACTIONS ═══ */}
      {isStatsPhase && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sb-enter" style={{ animationDelay: "200ms" }}>
          <Button
            size="lg"
            className="w-full sm:w-auto font-bold tracking-wide bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-[0_0_20px_rgba(212,161,33,0.2)] hover:shadow-[0_0_30px_rgba(212,161,33,0.3)]"
            onClick={() => router.push("/dashboard/collaboration")}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Rematch
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold tracking-wide border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Share2 className="mr-2 h-4 w-4" />
            Share Duel Result
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto text-white/40 hover:text-white/70"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      )}

      {/* ═══ MATCH REVIEW ═══ */}
      {isStatsPhase && (
        <div className="mt-12 pt-10 border-t border-white/[0.06] sb-enter" style={{ animationDelay: "400ms" }}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Match Review</h2>
            <p className="text-white/40 mt-1">Analyze every question from the duel.</p>
          </div>
          <AnswerReview result={result} />
        </div>
      )}
    </div>
  );
}
