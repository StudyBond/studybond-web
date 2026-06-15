"use client";

import { useEffect, useState } from "react";
import { Calendar, Hourglass, AlertCircle, CheckCircle2 } from "lucide-react";

export function ExamCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isLive: false,
  });

  useEffect(() => {
    // Exam starts July 27, 2026 at 08:00 AM West Africa Time (GMT+1)
    const examStart = new Date("2026-07-27T08:00:00+01:00").getTime();
    // Exam ends July 29, 2026 at 06:00 PM West Africa Time (GMT+1)
    const examEnd = new Date("2026-07-29T18:00:00+01:00").getTime();

    function updateTimer() {
      const now = new Date().getTime();

      if (now > examEnd) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isLive: false });
      } else if (now >= examStart && now <= examEnd) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isLive: true });
      } else {
        const difference = examStart - now;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false, isLive: false });
      }
    }

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds, isExpired, isLive } = timeLeft;

  // Determine stage based on days remaining
  let stage: "focus" | "caution" | "critical" | "urgent" | "live" | "completed" = "focus";
  if (isExpired) {
    stage = "completed";
  } else if (isLive) {
    stage = "live";
  } else if (days < 7) {
    stage = "urgent";
  } else if (days < 15) {
    stage = "critical";
  } else if (days <= 30) {
    stage = "caution";
  }

  // Visual config for each stage
  const stageConfigs = {
    focus: {
      bgColor: "bg-white/[0.01]",
      borderColor: "border-white/[0.06]",
      glowColor: "rgba(224, 144, 64, 0.02)",
      badgeClass: "bg-white/5 text-white/50 border-white/10",
      textColor: "text-white/60",
      icon: <Calendar className="h-4 w-4 text-[#e09040]/70" />,
      tag: "Focus Phase",
      message: "Plenty of time to master the syllabus. Build your daily streak and practice mock exams!",
      timerColor: "text-white/80",
    },
    caution: {
      bgColor: "bg-amber-500/[0.01]",
      borderColor: "border-amber-500/10",
      glowColor: "rgba(245, 158, 11, 0.04)",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      textColor: "text-white/65",
      icon: <Hourglass className="h-4 w-4 text-amber-400" />,
      tag: "Keep Momentum",
      message: "Time is passing. Complete at least one mock exam today to solidify your rhythm.",
      timerColor: "text-amber-300",
    },
    critical: {
      bgColor: "bg-orange-500/[0.02]",
      borderColor: "border-orange-500/20",
      glowColor: "rgba(249, 115, 22, 0.08)",
      badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/25",
      textColor: "text-white/75",
      icon: <Hourglass className="h-4 w-4 text-orange-400 animate-pulse" />,
      tag: "Crunch Time",
      message: "Final weeks! Review your score analytics and focus 60% of prep on weak subjects.",
      timerColor: "text-orange-400",
    },
    urgent: {
      bgColor: "bg-red-500/[0.02]",
      borderColor: "border-red-500/25",
      glowColor: "rgba(239, 68, 68, 0.12)",
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/25 animate-pulse",
      textColor: "text-white/85",
      icon: <AlertCircle className="h-4 w-4 text-red-400" />,
      tag: "Urgent Prep",
      message: "Exam week is here! Take a full, timed 90-minute CBT mock exam daily.",
      timerColor: "text-red-400",
    },
    live: {
      bgColor: "bg-emerald-500/[0.03]",
      borderColor: "border-emerald-500/30",
      glowColor: "rgba(16, 185, 129, 0.15)",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse",
      textColor: "text-white/90",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" />,
      tag: "Exam is Live",
      message: "UI Post-UTME CBT screening is officially ongoing. Go conquer it!",
      timerColor: "text-emerald-400",
    },
    completed: {
      bgColor: "bg-white/[0.01]",
      borderColor: "border-white/[0.04]",
      glowColor: "transparent",
      badgeClass: "bg-white/5 text-white/30 border-white/5",
      textColor: "text-white/40",
      icon: <CheckCircle2 className="h-4 w-4 text-white/30" />,
      tag: "Completed",
      message: "The 2026/2027 screening exercise has concluded.",
      timerColor: "text-white/30",
    },
  };

  const config = stageConfigs[stage];
  const padZero = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${config.bgColor} ${config.borderColor} p-4 transition-all duration-500`}
      style={{
        boxShadow: `0 4px 30px ${config.glowColor}, inset 0 1px 1px rgba(255,255,255,0.01)`,
      }}
    >
      {/* Dynamic ambient background glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-[40px] transition-all duration-500"
        style={{ backgroundColor: config.glowColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Info & Context */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-white/80">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="text-[11px] font-bold text-white/90">UI Post-UTME 2026 Countdown</span>
              <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.badgeClass}`}>
                {config.tag}
              </span>
            </div>
            <p className={`text-[12px] ${config.textColor} leading-relaxed`}>
              {config.message}
            </p>
          </div>
        </div>

        {/* Right Side: Digital Ticking Timer */}
        {!isExpired && !isLive && (
          <div className="flex items-center gap-3 self-center md:self-auto shrink-0 select-none">
            {/* Days */}
            <div className="flex flex-col items-center">
              <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${config.timerColor}`}>
                {padZero(days)}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/20">Days</span>
            </div>
            <span className="text-white/20 font-mono text-lg pb-3">:</span>
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${config.timerColor}`}>
                {padZero(hours)}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/20">Hrs</span>
            </div>
            <span className="text-white/20 font-mono text-lg pb-3">:</span>
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${config.timerColor}`}>
                {padZero(minutes)}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/20">Mins</span>
            </div>
            <span className="text-white/20 font-mono text-lg pb-3">:</span>
            {/* Seconds */}
            <div className="flex flex-col items-center w-8">
              <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${config.timerColor}`}>
                {padZero(seconds)}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/20">Secs</span>
            </div>
          </div>
        )}

        {isLive && (
          <div className="flex items-center gap-2 shrink-0 self-center md:self-auto">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">Screening Active</span>
          </div>
        )}

        {isExpired && (
          <div className="shrink-0 self-center md:self-auto">
            <span className="font-mono text-xs font-bold text-white/20 uppercase tracking-widest">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
