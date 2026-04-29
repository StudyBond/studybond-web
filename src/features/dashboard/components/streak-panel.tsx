import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { StreakSummary } from "@/lib/api/types";
import { Flame, Check, Sparkles } from "lucide-react";

export function StreakPanel({ streak }: { streak: StreakSummary }) {
  if (streak.currentStreak <= 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6">
        <EmptyState
          icon={<Flame className="h-5 w-5" />}
          description="Complete your first exam to ignite your streak."
          title="No streak yet"
        />
      </div>
    );
  }

  const milestoneProgress = streak.nextMilestone
    ? Math.min(100, ((streak.nextMilestone.days - streak.nextMilestone.remainingDays) / streak.nextMilestone.days) * 100)
    : 100;

  // Build a 7-day visual based on the real streak data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const streakDays = days.map((day, index) => {
    const distanceToToday = currentDayIndex - index;
    const isActive = distanceToToday >= 0 && distanceToToday < streak.currentStreak;
    const isToday = index === currentDayIndex;
    return { day, active: isActive, isToday };
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6 sm:p-8">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-orange-500/[0.08] blur-[60px]" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/10 text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.15)]">
            <Flame className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Streak</span>
        </div>
        <Badge tone={streak.studiedToday ? "success" : "streak"}>
          {streak.studiedToday ? "Active Today" : "Study Now"}
        </Badge>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-extrabold tracking-tighter text-white drop-shadow-md">
          {streak.currentStreak}
        </span>
        <span className="text-sm font-medium text-white/35">days</span>
      </div>
      <p className="mt-1 text-xs text-orange-400/60">Best: {streak.longestStreak} days</p>

      {/* 7-day visual */}
      <div className="mt-6 flex items-center justify-between gap-1.5">
        {streakDays.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center">
            <div
              className={`flex aspect-square w-full max-w-[2.2rem] items-center justify-center rounded-lg transition-all duration-300 ${
                d.active
                  ? "bg-gradient-to-t from-orange-500 to-[#e09040] text-[#09090b] shadow-[0_2px_10px_rgba(224,144,64,0.25)]"
                  : d.isToday
                    ? "bg-white/[0.06] border border-dashed border-orange-400/30 text-orange-400/40"
                    : "bg-white/[0.03] text-white/15"
              }`}
            >
              {d.active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
            </div>
            <p className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider ${d.active ? "text-[#e09040]" : "text-white/15"}`}>
              {d.day}
            </p>
          </div>
        ))}
      </div>

      {/* Milestone */}
      {streak.nextMilestone ? (
        <div className="mt-6 border-t border-white/[0.04] pt-5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-white/40 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              {streak.nextMilestone.label}
            </span>
            <span className="font-mono text-[#e09040]">
              {streak.nextMilestone.days - streak.nextMilestone.remainingDays}/{streak.nextMilestone.days}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#e09040] transition-all duration-1000 ease-out"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center text-[10px] text-white/20 border-t border-white/[0.04] pt-5">
          All milestones conquered. Legendary.
        </p>
      )}
    </div>
  );
}
