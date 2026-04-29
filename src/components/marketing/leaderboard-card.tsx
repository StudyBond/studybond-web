import { Crown, Medal } from "lucide-react";
import { leaderboardUsers } from "@/app/(marketing)/constants";

export function LeaderboardCard() {
  return (
    <div className="w-full max-w-sm mx-auto lg:mx-0">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/20 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="bg-gradient-to-br from-[#131316] to-[#0e0e11] p-5 pb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e09040]/[0.06] rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10 flex justify-between items-center">
            <div><h3 className="font-bold text-sm text-white/90">Leaderboard</h3><p className="text-white/30 text-xs mt-0.5">Top 50 · Weekly</p></div>
            <Crown className="h-5 w-5 text-[#e09040]" />
          </div>
        </div>
        <div className="-mt-5 px-3 pb-4 space-y-2 relative z-20">
          {leaderboardUsers.map((user, i) => (
            <div key={user.name} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 ${i === 0 ? "border-[#e09040]/20 bg-[#e09040]/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <span className="font-mono text-xs font-bold text-white/25 w-4 text-center">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.seed}`} alt={user.name} className="w-8 h-8 rounded-full bg-white/[0.05]" />
              <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white/80 truncate">{user.name}</p><p className="text-[0.6rem] text-white/25">{user.tag}</p></div>
              <div className="text-right"><span className="font-mono text-xs font-bold text-white/70">{user.sp}</span><span className="text-[0.55rem] text-white/20 ml-0.5">SP</span></div>
              {i === 0 ? <Medal className="h-3.5 w-3.5 text-[#e09040] shrink-0" /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
