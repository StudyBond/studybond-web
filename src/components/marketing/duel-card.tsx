import { Swords } from "lucide-react";

export function DuelCard() {
  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative">
        {/* Battle header */}
        <div className="bg-gradient-to-r from-red-500/[0.08] via-[#131316] to-blue-500/[0.08] p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0e11]/80" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-400/10 border border-red-400/15 px-3 py-1 text-[0.6rem] font-bold text-red-400 uppercase tracking-wider mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" /> Live Battle
            </div>
            <h3 className="font-bold text-sm text-white/90">1v1 Duel Mode</h3>
            <p className="text-[0.6rem] text-white/30 mt-0.5">Biology · 20 Questions · 15 Min</p>
          </div>
        </div>

        {/* VS layout */}
        <div className="p-5 flex items-center gap-3">
          {/* Player 1 */}
          <div className="flex-1 text-center">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Challenger" alt="You" className="w-14 h-14 rounded-full bg-white/[0.05] border-2 border-blue-400/30 mx-auto" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[0.5rem] font-bold text-white">⚡</span>
            </div>
            <p className="text-xs font-semibold text-white/70 mt-2">You</p>
            <p className="font-mono text-xl font-bold text-blue-400 mt-1">16</p>
            <p className="text-[0.55rem] text-white/20">/ 20 correct</p>
            <div className="mt-2 h-1 w-full rounded-full bg-white/[0.05] overflow-hidden"><div className="h-full rounded-full bg-blue-400 w-[80%]" /></div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/[0.08]">
              <Swords className="h-4 w-4 text-[#e09040]" />
            </div>
            <span className="text-[0.55rem] font-bold text-white/20 uppercase tracking-widest">VS</span>
          </div>

          {/* Player 2 */}
          <div className="flex-1 text-center">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent" alt="Opponent" className="w-14 h-14 rounded-full bg-white/[0.05] border-2 border-red-400/30 mx-auto" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[0.5rem] font-bold text-white">🔥</span>
            </div>
            <p className="text-xs font-semibold text-white/70 mt-2">Chioma O.</p>
            <p className="font-mono text-xl font-bold text-red-400 mt-1">14</p>
            <p className="text-[0.55rem] text-white/20">/ 20 correct</p>
            <div className="mt-2 h-1 w-full rounded-full bg-white/[0.05] overflow-hidden"><div className="h-full rounded-full bg-red-400 w-[70%]" /></div>
          </div>
        </div>

        {/* Battle stats */}
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center justify-between">
            <div className="text-center flex-1"><p className="text-[0.55rem] text-white/20 uppercase tracking-wider">Time left</p><p className="font-mono text-sm font-bold text-[#e09040]">4:32</p></div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center flex-1"><p className="text-[0.55rem] text-white/20 uppercase tracking-wider">Question</p><p className="font-mono text-sm font-bold text-white/70">18/20</p></div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center flex-1"><p className="text-[0.55rem] text-white/20 uppercase tracking-wider">Reward</p><p className="font-mono text-sm font-bold text-emerald-400">+120 SP</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
