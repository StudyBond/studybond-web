"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { ExamHistory } from "@/lib/api/types";
import { formatPercent } from "@/lib/utils/format";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

type AnalyticsPanelProps = {
  query: UseQueryResult<ExamHistory, Error>;
};

function getTrendDirection(exams: ExamHistory["exams"]) {
  if (exams.length < 2) return "neutral" as const;
  const recent = exams.slice(0, Math.ceil(exams.length / 2));
  const older = exams.slice(Math.ceil(exams.length / 2));
  const recentAvg = recent.reduce((s, e) => s + e.percentage, 0) / recent.length;
  const olderAvg = older.reduce((s, e) => s + e.percentage, 0) / older.length;
  const diff = recentAvg - olderAvg;
  if (diff > 3) return "up" as const;
  if (diff < -3) return "down" as const;
  return "neutral" as const;
}

export function AnalyticsPanel({ query }: AnalyticsPanelProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (query.isLoading) {
    return <Skeleton className="min-h-72 rounded-3xl" />;
  }

  if (!query.data || query.data.exams.length === 0) {
    return null;
  }

  const { exams, stats } = query.data;

  // SVG trend line from exam scores (chronological order)
  const chronological = [...exams].reverse();
  const maxScore = Math.max(...chronological.map(e => e.percentage), 10);
  const minScore = Math.min(...chronological.map(e => e.percentage), 0);
  const width = 100;
  const height = 40;

  const pathPoints = chronological.map((exam, i) => {
    const x = chronological.length > 1 ? (i / (chronological.length - 1)) * width : width / 2;
    const normalizedY = (exam.percentage - minScore) / Math.max(maxScore - minScore, 1);
    const y = height - (normalizedY * (height - 8) + 4);
    return { x, y, exam };
  });

  const linePath = `M ${pathPoints.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const areaPath = `M ${pathPoints[0].x} ${height} L ${pathPoints.map(p => `${p.x},${p.y}`).join(" L ")} L ${pathPoints[pathPoints.length - 1].x} ${height} Z`;

  // Compute total line length for draw-in animation
  let lineLength = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    const dx = pathPoints[i].x - pathPoints[i - 1].x;
    const dy = pathPoints[i].y - pathPoints[i - 1].y;
    lineLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Subject frequency
  const subjectCounts: Record<string, number> = {};
  for (const exam of exams) {
    for (const subj of exam.subjects) {
      subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
    }
  }
  const subjectEntries = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxSubjectCount = subjectEntries[0]?.[1] ?? 1;

  const trend = getTrendDirection(exams);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/40";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[var(--sb-bg-surface-1)] to-[#09090b] p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.1)]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Performance
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <AnimatedCounter
            value={stats.averageScore}
            format={(n) => formatPercent(Math.round(n))}
            className="font-mono text-sm font-bold text-white"
            duration={1000}
          />
          <span className="text-[10px] text-white/30">avg</span>
        </div>
      </div>

      {/* SVG Trend Chart — with draw-in animation */}
      <div className="rounded-2xl border border-white/[0.04] bg-[var(--sb-bg-surface-1)] p-4 pb-2 h-36 overflow-hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Score Trend</span>
          <div className="flex items-center gap-3 text-[9px] text-white/20">
            <span>Best: <span className="text-emerald-400 font-mono">{formatPercent(stats.bestScore)}</span></span>
            <span>Total SP: <span className="text-[#e09040] font-mono">{stats.totalSpEarned.toLocaleString()}</span></span>
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="analyticsTrendLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="analyticsTrendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#analyticsTrendArea)" className="opacity-0 animate-[sb-fade-in_0.8s_ease-out_0.5s_forwards]" />

          {/* Animated trend line — draws in */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#analyticsTrendLine)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]"
            style={{
              strokeDasharray: lineLength,
              strokeDashoffset: lineLength,
              animation: `sb-draw-line 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards`,
              ["--line-length" as string]: lineLength,
            }}
          />

          {/* Data points — interactive with hover tooltips */}
          {pathPoints.map((point, i) => (
            <g key={i}>
              {/* Hover area (larger, invisible) */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Visible dot */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === i ? "3" : "2"}
                fill="#09090b"
                stroke={hoveredPoint === i ? "#fbbf24" : "#34d399"}
                strokeWidth={hoveredPoint === i ? "1.5" : "1"}
                className="transition-all duration-200"
                style={{
                  opacity: 0,
                  animation: `sb-fade-in 0.3s ease-out ${0.5 + i * 0.1}s forwards`,
                }}
              />
              {/* Hover tooltip */}
              {hoveredPoint === i ? (
                <g>
                  <rect
                    x={point.x - 14}
                    y={point.y - 16}
                    width="28"
                    height="10"
                    rx="3"
                    fill="#18181b"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={point.x}
                    y={point.y - 9}
                    textAnchor="middle"
                    className="text-[3px] fill-white font-mono font-bold"
                  >
                    {formatPercent(point.exam.percentage)}
                  </text>
                </g>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      {/* Subject Breakdown — with animated bars */}
      {subjectEntries.length > 0 ? (
        <div>
          <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Subject Distribution</span>
          <div className="mt-3 space-y-2.5">
            {subjectEntries.map(([subject, count], idx) => {
              const pct = (count / maxSubjectCount) * 100;
              return (
                <div key={subject} className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-white/50 w-24 truncate shrink-0">{subject}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400"
                      style={{
                        width: `${pct}%`,
                        animation: `sb-slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + idx * 0.1}s both`,
                        transformOrigin: "left center",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 w-6 text-right shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
