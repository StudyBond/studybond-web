import type { Route } from "next";
import { ArrowRight, Check, Crown, Shield, Sparkles, Swords, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserStats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type CollaborationCardProps = {
  stats: UserStats;
};

export function CollaborationCard({ stats }: CollaborationCardProps) {
  const duelsCompleted = stats.completedCollaborationExams;
  const isEligible = stats.isPremium && stats.realExamsCompleted >= 2;
  const needsPremium = !stats.isPremium;
  const needsMoreRealExams = stats.isPremium && stats.realExamsCompleted < 2;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(224,144,64,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_32%),linear-gradient(145deg,#0d0d10_0%,#111318_52%,#09090b_100%)] p-6">
      <div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_0%,rgba(255,255,255,0.03)_36%,transparent_68%)]" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/12 text-fuchsia-300 shadow-[0_0_18px_rgba(168,85,247,0.16)]">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/28">
                Collaboration
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-white">
                Premium duel rooms
              </h3>
            </div>
          </div>

          <Badge tone={isEligible ? "success" : "neutral"}>
            {isEligible ? "Ready" : "Locked"}
          </Badge>
        </div>

        <p className="max-w-sm text-sm leading-relaxed text-white/48">
          Build a room, invite one challenger, and launch the same timed paper
          for both players with StudyBond handling the lobby and exam handoff.
        </p>

        <div className="mt-6 flex items-end gap-2">
          <span className="font-mono text-4xl font-bold text-white">
            {duelsCompleted}
          </span>
          <span className="pb-1 text-sm text-white/38">
            {duelsCompleted === 1 ? "room finished" : "rooms finished"}
          </span>
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-white/[0.05] bg-black/20 p-4">
          {[
            {
              label: "Premium membership",
              satisfied: stats.isPremium,
            },
            {
              label:
                stats.realExamsCompleted >= 2
                  ? "2+ real exams completed"
                  : `${stats.realExamsCompleted}/2 real exams completed`,
              satisfied: stats.realExamsCompleted >= 2,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  item.satisfied
                    ? "bg-emerald-400/12 text-emerald-400"
                    : "bg-red-400/12 text-red-400",
                )}
              >
                {item.satisfied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="text-sm text-white/55">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {isEligible ? (
            <Button asChild className="w-full" href={"/dashboard/collaboration" as Route}>
              <>
                Open collaboration hub
                <ArrowRight className="h-4 w-4" />
              </>
            </Button>
          ) : needsPremium ? (
            <Button asChild className="w-full" href={"/dashboard/settings" as Route}>
              <>
                Upgrade for duel access
                <Crown className="h-4 w-4" />
              </>
            </Button>
          ) : needsMoreRealExams ? (
            <Button asChild className="w-full" href={"/dashboard/practice" as Route}>
              <>
                Finish unlock exams
                <Sparkles className="h-4 w-4" />
              </>
            </Button>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-white/28">
            <Shield className="h-3.5 w-3.5" />
            Same room code, same paper, same timing pressure.
          </div>
        </div>
      </div>
    </div>
  );
}
