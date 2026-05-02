"use client";

import { Crown, Loader2, Target, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DuelWaitingLobbyProps = {
  opponentName: string;
  opponentProgress: { current: number; total: number } | null;
  opponentFinished: boolean;
};

export function DuelWaitingLobby({
  opponentName,
  opponentProgress,
  opponentFinished,
}: DuelWaitingLobbyProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--sb-bg)] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(224,144,64,0.08),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-500">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.03] shadow-2xl shadow-black/50 border border-white/[0.08]">
            <Timer className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
            Waiting for Opponent
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mx-auto">
            You finished the duel! The results will be revealed once {opponentName} submits their paper.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(140deg,rgba(224,144,64,0.2),rgba(255,255,255,0.05))] font-bold text-white shadow-inner shadow-white/10">
                {opponentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{opponentName}</p>
                <p className="text-xs text-white/40">Opponent</p>
              </div>
            </div>
            {opponentFinished ? (
              <Badge tone="success">Finished</Badge>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-sky-500/10 text-sky-400 text-xs font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Working
              </div>
            )}
          </div>

          {!opponentFinished && opponentProgress && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  Progress
                </span>
                <span className="font-mono font-bold text-white/80">
                  {opponentProgress.current} / {opponentProgress.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#e09040,#fcd34d)] transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, (opponentProgress.current / opponentProgress.total) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
