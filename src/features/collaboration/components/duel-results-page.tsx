"use client";

import { Crown, Trophy, Swords, Clock, Target, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ExamResult, CollaborationSessionSnapshot } from "@/lib/api/types";
import { AnswerReview } from "@/features/exam/components/answer-review";

type DuelResultsPageProps = {
  result: ExamResult;
  collabSession: CollaborationSessionSnapshot["session"];
  myUserId: number;
};

export function DuelResultsPage({ result, collabSession, myUserId }: DuelResultsPageProps) {
  const router = useRouter();

  // Match by the authenticated user's numeric ID — NOT by comparing
  // fullName against result.displayNameLong (which is a generated exam
  // title like "1v1 Duel #3: Physics, Mathematics").
  const me = collabSession.participants.find((p) => p.userId === myUserId);
  const opponent = collabSession.participants.find((p) => p.userId !== myUserId);

  if (!me || !opponent) return null;

  const didIWin = me.finalRank === 1;
  const isDraw = me.score === opponent.score;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 pb-24 space-y-12">
      {/* HEADER */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <Trophy className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
          {isDraw ? "It's a Draw!" : didIWin ? "Victory!" : "Defeat"}
        </h1>
        <p className="text-white/50 max-w-md mx-auto">
          {isDraw
            ? "A clash of equals. You both fought valiantly."
            : didIWin
              ? "You dominated the arena. Claim your glory!"
              : "You fell in battle. Dust yourself off and try again."}
        </p>
      </div>

      {/* HEAD TO HEAD CARD */}
      <div className="relative rounded-[32px] border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-2xl p-6 md:p-12 overflow-hidden shadow-2xl">
        {/* Decorative backgrounds */}
        <div className={`absolute top-0 ${didIWin ? 'left-0' : 'right-0'} w-1/2 h-full bg-gradient-to-r ${didIWin ? 'from-amber-500/10' : 'from-transparent'} ${didIWin ? 'to-transparent' : 'to-amber-500/10'} opacity-50 blur-3xl pointer-events-none`} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* MY STATS */}
          <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
            {didIWin && (
              <div className="mb-4 flex items-center gap-2 text-amber-400 font-bold tracking-widest text-xs uppercase animate-pulse">
                <Crown className="h-4 w-4" /> Winner
              </div>
            )}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 font-bold text-3xl text-white shadow-inner shadow-white/10 mb-4">
              {me.fullName.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{me.fullName}</h3>
            <p className="text-white/40 text-sm mb-6">You</p>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-[200px]">
              <div>
                <p className="text-xs text-white/40 mb-1">Score</p>
                <p className="text-3xl font-black text-white">{me.score}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Time</p>
                <p className="text-xl font-bold text-white/80">{Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</p>
              </div>
            </div>
          </div>

          {/* VS BADGE */}
          <div className="shrink-0 relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-xl border-4 border-[#0a0a0a]">
              <Swords className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* OPPONENT STATS */}
          <div className="flex-1 w-full flex flex-col items-center md:items-end text-center md:text-right">
            {!didIWin && !isDraw && (
              <div className="mb-4 flex items-center gap-2 text-amber-400 font-bold tracking-widest text-xs uppercase animate-pulse">
                <Crown className="h-4 w-4" /> Winner
              </div>
            )}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 font-bold text-3xl text-white shadow-inner shadow-white/10 mb-4">
              {opponent.fullName.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{opponent.fullName}</h3>
            <p className="text-white/40 text-sm mb-6">Opponent</p>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-[200px]">
              <div className="md:text-right">
                <p className="text-xs text-white/40 mb-1">Score</p>
                <p className="text-3xl font-black text-white">{opponent.score ?? "-"}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs text-white/40 mb-1">SP Earned</p>
                <p className="text-xl font-bold text-amber-400">+{opponent.spEarned ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button size="lg" className="w-full sm:w-auto font-bold tracking-wide" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
        <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold tracking-wide border-white/10 bg-white/5 text-white hover:bg-white/10">
          <Share2 className="mr-2 h-4 w-4" /> Share Result
        </Button>
      </div>

      {/* REVIEW SECTION */}
      <div className="pt-12 border-t border-white/[0.08]">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white">Match Review</h2>
          <p className="text-white/50">Analyze your performance and learn from your mistakes.</p>
        </div>
        <AnswerReview result={result} />
      </div>
    </div>
  );
}
