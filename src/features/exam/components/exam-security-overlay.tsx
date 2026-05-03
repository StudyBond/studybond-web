"use client";

import { cn } from "@/lib/utils/cn";
import { ShieldAlert, AlertTriangle, Eye, Fingerprint } from "lucide-react";
import type { ExamGuardState } from "@/features/exam/hooks/use-exam-guard";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ExamSecurityOverlayProps = {
  guardState: ExamGuardState;
  onDismiss: () => void;
  /** "exam" shows auto-submit countdown. "review" shows just a warning. */
  mode: "exam" | "review";
};

export function ExamSecurityOverlay({
  guardState,
  onDismiss,
  mode,
}: ExamSecurityOverlayProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (guardState.violationActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [guardState.violationActive]);

  if (!guardState.violationActive || !isMounted) return null;

  const isTabSwitch = guardState.violationType === "tab_switch";
  const isScreenshot = guardState.violationType === "screenshot";
  const isMultiTouch = guardState.violationType === "multi_touch";
  const canDismiss = mode === "exam" ? guardState.violationCount < 3 : true;

  let title = "Focus Mode Violation";
  let description = "You left the exam tab. StudyBond requires full focus during active exams to maintain integrity.";
  
  if (isScreenshot) {
    title = "Screenshot Blocked";
    description = "Screenshots are not allowed during exams. Your exam content is protected by StudyBond's integrity system.";
  } else if (isMultiTouch) {
    title = "Suspicious Gesture Detected";
    description = "A multi-finger gesture was detected. StudyBond restricts complex gestures during exams to prevent unauthorized captures.";
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop — completely opaque to cover all content */}
      <div className="absolute inset-0 bg-[#09090b]/[0.97] backdrop-blur-xl" />

      {/* Repeating watermark background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.03) 80px,
            rgba(255,255,255,0.03) 82px
          )`,
        }} />
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-white/[0.15] text-xl font-black tracking-[0.3em] uppercase whitespace-nowrap"
            style={{
              top: `${8 + (i * 8)}%`,
              left: `${(i % 2 === 0 ? -5 : 10)}%`,
              transform: `rotate(-15deg)`,
            }}
          >
            STUDYBOND PROTECTED • NO CHEATING • EXAM SECURED •
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-8 w-full max-w-md mx-auto max-h-[100dvh] overflow-y-auto no-scrollbar">
        {/* Shield icon with pulse */}
        <div className="relative mb-6 sm:mb-8 shrink-0">
          <div className={cn(
            "flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl",
            isScreenshot || isMultiTouch
              ? "bg-red-500/15 text-red-400"
              : "bg-amber-500/15 text-amber-400",
          )}>
            {isScreenshot ? (
              <Eye className="h-10 w-10 sm:h-12 sm:w-12" />
            ) : isMultiTouch ? (
              <Fingerprint className="h-10 w-10 sm:h-12 sm:w-12" />
            ) : (
              <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12" />
            )}
          </div>
          {/* Animated pulse ring */}
          <div className={cn(
            "absolute inset-0 rounded-3xl animate-ping opacity-20",
            isScreenshot || isMultiTouch ? "bg-red-400" : "bg-amber-400",
          )} style={{ animationDuration: "2s" }} />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 sm:mb-3 shrink-0">
          {title}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-6 sm:mb-8 max-w-xs shrink-0">
          {description}
        </p>

        {/* Countdown (exam mode only) */}
        {mode === "exam" && (
          <div className="mb-6 sm:mb-8 shrink-0">
            {/* Countdown ring */}
            <div className="relative flex items-center justify-center">
              <svg className="h-24 w-24 sm:h-28 sm:w-28 -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="currentColor" strokeWidth="4"
                  className="text-white/[0.06]"
                />
                {/* Progress */}
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="currentColor" strokeWidth="4"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * guardState.countdownSeconds) / 5}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-1000 ease-linear",
                    guardState.countdownSeconds <= 2 ? "text-red-400" : "text-amber-400",
                  )}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={cn(
                  "text-2xl sm:text-3xl font-black font-mono tabular-nums transition-colors",
                  guardState.countdownSeconds <= 2 ? "text-red-400" : "text-amber-400",
                )}>
                  {guardState.countdownSeconds}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
                  seconds
                </span>
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] text-white/30 mt-4">
              {guardState.violationCount >= 2
                ? "Final warning — next violation will auto-submit immediately."
                : "Your exam will be auto-submitted when the timer reaches zero."}
            </p>
          </div>
        )}

        {/* Violation counter */}
        {mode === "exam" && guardState.violationCount > 1 && (
          <div className="flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 rounded-xl bg-red-400/[0.06] border border-red-400/15 shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold text-red-400/80">
              Violation {guardState.violationCount} of {3} — your exam integrity is at risk
            </span>
          </div>
        )}

        {/* Return button */}
        {canDismiss && (
          <button
            onClick={() => {
              // Request fullscreen on return to make it rugged
              if (mode === "exam" && !document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
              onDismiss();
            }}
            className={cn(
              "flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 w-full sm:w-auto shrink-0",
              "bg-white/[0.06] text-white/80 hover:bg-white/[0.10] hover:text-white",
              "border border-white/[0.08] hover:border-white/[0.15]",
              "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            {mode === "exam" ? "Return to Exam (Fullscreen)" : "I Understand"}
          </button>
        )}

        {/* Review mode note */}
        {mode === "review" && (
          <p className="text-[10px] text-white/20 mt-4 sm:mt-6 max-w-xs shrink-0">
            StudyBond exam content is proprietary and protected. Unauthorized reproduction is prohibited.
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
