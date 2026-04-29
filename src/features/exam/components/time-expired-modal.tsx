"use client";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

type TimeExpiredModalProps = {
  onAutoSubmit: () => void;
};

export function TimeExpiredModal({ onAutoSubmit }: TimeExpiredModalProps) {
  const open = useExamStore((s) => s.timeExpiredModalOpen);
  const [phase, setPhase] = useState<"freeze" | "gathering" | "submitting">("freeze");

  useEffect(() => {
    if (!open) {
      setPhase("freeze");
      return;
    }

    // Phase 1: Freeze — show "Time Expired" for 1.5s
    const t1 = setTimeout(() => setPhase("gathering"), 1500);
    // Phase 2: "Gathering answers" for 2s
    const t2 = setTimeout(() => {
      setPhase("submitting");
      onAutoSubmit();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, onAutoSubmit]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Heavy glassmorphism backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500" />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center px-6 animate-in fade-in zoom-in-90 duration-700">
        {/* Pulsing timer icon */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150 animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-400/30 bg-red-500/10">
            <Timer className="h-8 w-8 text-red-400" />
          </div>
        </div>

        {/* Phase text */}
        {phase === "freeze" ? (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Time Expired
            </h2>
            <p className="text-base text-white/40">
              Your exam time has ended.
            </p>
          </div>
        ) : phase === "gathering" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Gathering your answers...
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-2 w-2 rounded-full bg-[var(--sb-accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 rounded-full bg-[var(--sb-accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 rounded-full bg-[var(--sb-accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Submitting...
            </h2>
            <div className="mt-4">
              <svg className="mx-auto h-8 w-8 animate-spin text-[var(--sb-accent)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
