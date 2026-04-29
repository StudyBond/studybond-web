import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExamHistory } from "@/lib/api/types";
import { formatDate, formatPercent } from "@/lib/utils/format";
import { BarChart3, History, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UseQueryResult } from "@tanstack/react-query";

function scoreColor(percentage: number) {
  if (percentage >= 70) return "text-emerald-400";
  if (percentage >= 40) return "text-[#e09040]";
  return "text-red-400";
}

function scoreBg(percentage: number) {
  if (percentage >= 70) return "bg-emerald-400";
  if (percentage >= 40) return "bg-[#e09040]";
  return "bg-red-400";
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
}

export function ExamHistoryPanel({
  query,
  variant = "full",
}: {
  query: UseQueryResult<ExamHistory, Error>;
  variant?: "full" | "compact";
}) {
  if (query.isLoading) {
    return <Skeleton className="min-h-64 rounded-3xl" />;
  }

  if (query.isError) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6">
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          description="Something went wrong loading your exam history."
          title="Could not load history"
        />
      </div>
    );
  }

  if (!query.data || query.data.exams.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6">
        <EmptyState
          icon={<History className="h-5 w-5" />}
          description="Take your first exam to see your history here."
          title="No exams yet"
        />
      </div>
    );
  }

  const exams = query.data.exams.slice(0, 5);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6 sm:p-8 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Recent Exams
          </span>
        </div>
        {variant === "full" ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">Avg:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{formatPercent(query.data.stats.averageScore)}</span>
          </div>
        ) : null}
      </div>

      {/* Exam List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {exams.map((exam, idx) => (
          <div
            className="group flex items-center gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-3 transition-all duration-300 hover:bg-white/[0.03] hover:border-white/[0.06]"
            key={exam.id}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Score */}
            <div className="flex w-11 flex-col items-center shrink-0">
              <span className={cn("font-mono text-base font-bold drop-shadow-sm", scoreColor(exam.percentage))}>
                {formatPercent(exam.percentage)}
              </span>
            </div>

            <div className="h-7 w-px bg-white/[0.04]" />

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{exam.displayNameShort}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/30">
                  {exam.subjects.length} subj
                </span>
                {exam.timeTakenSeconds ? (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDuration(exam.timeTakenSeconds)}
                    </span>
                  </>
                ) : null}
                <span className="text-white/10">·</span>
                <span className="text-[10px] text-white/25">{formatDate(exam.completedAt || exam.startedAt)}</span>
              </div>
            </div>

            {/* SP + progress */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-0.5 rounded bg-[#e09040]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#e09040]">
                +{exam.spEarned}
              </span>
              <div className="hidden sm:block w-16 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", scoreBg(exam.percentage))}
                  style={{ width: `${Math.min(100, exam.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
