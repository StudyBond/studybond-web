"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StreakCalendar } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

type StreakHeatmapProps = {
  query: UseQueryResult<StreakCalendar, Error>;
};

function getIntensity(sp: number): 0 | 1 | 2 | 3 | 4 {
  if (sp <= 0) return 0;
  if (sp < 50) return 1;
  if (sp < 150) return 2;
  if (sp < 400) return 3;
  return 4;
}

const weekdayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

/** Chunk the days array into pages of `pageSize` days. */
function paginate<T>(arr: T[], pageSize: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < arr.length; i += pageSize) {
    pages.push(arr.slice(i, i + pageSize));
  }
  return pages;
}

export function StreakHeatmap({ query }: StreakHeatmapProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const pages = useMemo(() => {
    if (!query.data) return [];
    // The API returns days in chronological order (oldest first).
    // We show most recent page first, so reverse the entire array,
    // then split into pages of 28 (4 weeks).
    const reversed = [...query.data.days].reverse();
    return paginate(reversed, 28);
  }, [query.data]);

  if (query.isLoading) {
    return <Skeleton className="min-h-64 rounded-3xl" />;
  }

  if (!query.data || query.data.days.length === 0) {
    return null;
  }

  const data = query.data;
  const currentPage = pages[pageIndex] ?? [];

  // Build a 7-row × N-column grid from the page days.
  // Each column is a week, each row is a day of the week (Mon=0 → Sun=6).
  const weeks: (typeof currentPage[number] | null)[][] = [];
  let weekCol: (typeof currentPage[number] | null)[] = [];

  for (let i = 0; i < currentPage.length; i++) {
    const day = currentPage[i];
    const date = new Date(day.date);
    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1; // Mon=0

    // If we're starting a new week and we have pending data, push the old week.
    if (i > 0 && dayOfWeek === 0 && weekCol.length > 0) {
      // Pad incomplete weeks
      while (weekCol.length < 7) weekCol.push(null);
      weeks.push(weekCol);
      weekCol = [];
    }

    // Pad beginning of first week
    if (i === 0 && dayOfWeek > 0) {
      for (let p = 0; p < dayOfWeek; p++) weekCol.push(null);
    }

    weekCol.push(day);
  }
  // Push final week
  if (weekCol.length > 0) {
    while (weekCol.length < 7) weekCol.push(null);
    weeks.push(weekCol);
  }

  const activeDays = currentPage.filter(d => d.studied).length;
  const hasPrev = pageIndex < pages.length - 1;
  const hasNext = pageIndex > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0e0e11] to-[#09090b] p-6 sm:p-8">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-orange-500/[0.08] blur-[60px]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/10 text-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.15)]">
            <Flame className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Study Activity
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="streak">
            {activeDays} active {activeDays === 1 ? "day" : "days"}
          </Badge>

          {/* Page navigation (carousel) */}
          {pages.length > 1 ? (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setPageIndex(p => p + 1)}
                disabled={!hasPrev}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.05] hover:text-white/60 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Older days"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-mono text-white/25 min-w-[3ch] text-center">
                {pageIndex + 1}/{pages.length}
              </span>
              <button
                onClick={() => setPageIndex(p => p - 1)}
                disabled={!hasNext}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.05] hover:text-white/60 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Newer days"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative z-10 flex gap-1">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 mr-1 pt-0">
          {weekdayLabels.map((label, i) => (
            <div key={i} className="flex h-[18px] items-center">
              <span className="text-[9px] font-medium text-white/20 w-6 text-right">{label}</span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              if (!day) {
                return <div key={di} className="h-[18px] w-[18px]" />;
              }
              const intensity = getIntensity(day.spEarnedToday);
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.spEarnedToday} SP, ${day.examsTaken} exams`}
                  className={cn(
                    "sb-heatmap-cell h-[18px] w-[18px] rounded-[4px] transition-all duration-200 hover:scale-125 hover:z-10 cursor-default",
                    `sb-heatmap-intensity-${intensity}`,
                    day.isToday && "ring-1 ring-[#e09040]/50 ring-offset-1 ring-offset-[#09090b]",
                  )}
                  style={{ animationDelay: `${(wi * 7 + di) * 15}ms` }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="relative z-10 mt-5 flex items-center justify-between">
        <p className="text-[10px] text-white/25">
          {data.currentStreak > 0 ? `${data.currentStreak} day streak` : "No active streak"}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-white/20">Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={cn("h-[10px] w-[10px] rounded-[2px]", `sb-heatmap-intensity-${level}`)} />
          ))}
          <span className="text-[9px] text-white/20">More</span>
        </div>
      </div>
    </div>
  );
}
