"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import { Timer, ArrowRight, Target, Clock } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { ExamSummary } from "@/lib/api/types";

type ExamCardProps = {
  exam: ExamSummary;
};

function formatTimeAgo(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function ExamCard({ exam }: ExamCardProps) {
  const isAbandoned = exam.status === "ABANDONED";
  const isCompleted = exam.status === "COMPLETED";

  const colorClass = useMemo(() => {
    if (isAbandoned) return "text-white/30";
    if (exam.percentage >= 75) return "text-emerald-400";
    if (exam.percentage >= 50) return "text-amber-400";
    return "text-red-400";
  }, [isAbandoned, exam.percentage]);

  const bgGlow = useMemo(() => {
    if (isAbandoned) return "";
    if (exam.percentage >= 75) return "group-hover:bg-emerald-400/[0.03]";
    if (exam.percentage >= 50) return "group-hover:bg-amber-400/[0.03]";
    return "group-hover:bg-red-400/[0.03]";
  }, [isAbandoned, exam.percentage]);

  const resultHref = exam.collaborationSessionCode
    ? (`/exams/${exam.id}/results?collab=${exam.collaborationSessionCode}` as Route)
    : (`/exams/${exam.id}/results` as Route);

  return (
    <Link
      href={resultHref}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-2xl",
        bgGlow,
      )}
    >
      {/* Background flare on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top row: Badges & Relative Time */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Type Badge */}
          <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/50">
            {exam.examType.replace(/_/g, " ")}
          </span>
          {/* Subjects (limit to 2 for brevity on card) */}
          {exam.subjects.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-[10px] uppercase font-bold text-white/30"
            >
              {s.slice(0, 3)}
            </span>
          ))}
          {exam.subjects.length > 2 && (
            <span className="text-[10px] uppercase font-bold text-white/30">
              +{exam.subjects.length - 2}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-white/30 whitespace-nowrap">
          {formatTimeAgo(exam.startedAt)}
        </span>
      </div>

      {/* Main Row: Title & Score */}
      <div className="flex items-end justify-between border-b border-white/[0.06] pb-5 mb-5">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white/90 truncate mb-1">
            {exam.displayNameShort}
          </h3>
          <p className="text-xs text-white/40">
            Session #{exam.sessionNumber}{" "}
            {exam.isRetake ? `(Attempt ${exam.attemptNumber})` : ""}
          </p>
        </div>
        {isCompleted ? (
          <div className="text-right">
            <div
              className={cn(
                "sb-mono text-2xl md:text-3xl font-bold tracking-tighter leading-none mb-1",
                colorClass,
              )}
            >
              {exam.percentage}%
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
              Score
            </span>
          </div>
        ) : (
          <div className="text-right flex flex-col items-end">
            <span className="inline-flex rounded-lg border border-red-400/20 bg-red-400/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-red-400/80 mb-1">
              Abandoned
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-medium text-white/40">
          <span className="flex items-center gap-1.5" title="Total Questions">
            <Target className="h-3.5 w-3.5 text-white/20" />
            {exam.score} / {exam.totalQuestions}
          </span>
          {exam.timeTakenSeconds !== null && (
            <span className="flex items-center gap-1.5" title="Time Taken">
              <Clock className="h-3.5 w-3.5 text-white/20" />
              {Math.floor(exam.timeTakenSeconds / 60)}m{" "}
              {exam.timeTakenSeconds % 60}s
            </span>
          )}
        </div>

        {/* SP Earned Badge mapped strictly to completion */}
        {isCompleted && exam.spEarned > 0 ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--sb-accent)]/10 px-2 py-1 text-xs font-bold text-[var(--sb-accent)] border border-[var(--sb-accent)]/20 shadow-[0_0_10px_var(--sb-accent-glow)]">
            +{exam.spEarned} SP
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04] text-white/20 transition-colors group-hover:bg-white/[0.08] group-hover:text-white/60">
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </Link>
  );
}
