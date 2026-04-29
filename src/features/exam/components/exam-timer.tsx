"use client";

import { useEffect, useRef } from "react";
import { useExamStore } from "@/features/exam/stores/exam-store";
import { cn } from "@/lib/utils/cn";
import { Timer } from "lucide-react";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamTimer() {
  const remainingSeconds = useExamStore((s) => s.remainingSeconds);
  const timerRunning = useExamStore((s) => s.timerRunning);
  const timerTier = useExamStore((s) => s.timerTier);
  const tick = useExamStore((s) => s.tick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning, remainingSeconds > 0, tick]);

  const tierStyles = {
    normal: "text-white/60 bg-white/[0.04] border-white/[0.06]",
    warning: "text-amber-400 bg-amber-400/[0.06] border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.08)]",
    critical: "text-red-400 bg-red-400/[0.06] border-red-400/20 shadow-[0_0_20px_rgba(248,113,113,0.1)] exam-timer-pulse",
    final: "text-red-300 bg-red-500/[0.1] border-red-400/30 shadow-[0_0_30px_rgba(248,113,113,0.15)] exam-timer-pulse-fast",
    expired: "text-red-300 bg-red-500/[0.15] border-red-400/40",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-500",
        tierStyles[timerTier],
      )}
    >
      <Timer className={cn(
        "h-3.5 w-3.5 transition-colors duration-300",
        timerTier === "normal" && "text-white/40",
        timerTier === "warning" && "text-amber-400",
        (timerTier === "critical" || timerTier === "final") && "text-red-400",
      )} />
      <span className="sb-mono text-sm font-bold tabular-nums tracking-wide">
        {formatTime(remainingSeconds)}
      </span>
    </div>
  );
}
