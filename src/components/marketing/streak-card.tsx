import { Flame, Check } from "lucide-react";
import { streakDays } from "@/app/(marketing)/constants";

export function StreakCard() {
  return (
    <div className="w-full max-w-sm mx-auto lg:mx-0">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-2"><Flame className="h-5 w-5 text-orange-400" /><span className="text-sm font-semibold text-white/80">Study Streak</span></div><span className="text-xs text-white/25">This week</span></div>
        <div className="text-center mb-5"><span className="font-mono text-5xl font-bold text-white">5</span><p className="text-xs text-white/40 mt-1">days in a row</p></div>
        <div className="flex items-center justify-between gap-1.5">
          {streakDays.map((d) => (
            <div key={d.day} className="flex-1 text-center">
              <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${d.active ? "bg-gradient-to-t from-orange-500 to-[#e09040] text-[#09090b] shadow-[0_2px_12px_rgba(224,144,64,0.2)]" : "bg-white/[0.04] text-white/15"}`}>
                {d.active ? <Check className="h-3.5 w-3.5" /> : null}
              </div>
              <p className={`text-[0.55rem] mt-1.5 ${d.active ? "text-[#e09040]" : "text-white/15"}`}>{d.day}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs mb-2"><span className="text-white/40">Next milestone: 7 days</span><span className="font-mono text-[#e09040]">5/7</span></div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#e09040] w-[71%]" /></div>
        </div>
      </div>
    </div>
  );
}
