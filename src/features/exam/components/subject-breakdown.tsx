"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import type { ExamResult, QuestionWithAnswer } from "@/lib/api/types";

type SubjectBreakdownProps = {
  result: ExamResult;
};

type SubjectStat = {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
};

export function SubjectBreakdown({ result }: SubjectBreakdownProps) {
  // Aggregate stats per subject
  const stats = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    
    // Initialize map with all subjects
    result.subjects.forEach(s => map.set(s, { total: 0, correct: 0 }));

    // Count correct/total
    result.questions.forEach((q: QuestionWithAnswer) => {
      const current = map.get(q.subject) || { total: 0, correct: 0 };
      current.total += 1;
      if (q.isCorrect) {
        current.correct += 1;
      }
      map.set(q.subject, current);
    });

    const breakdown: SubjectStat[] = [];
    map.forEach((data, subject) => {
       if (data.total > 0) {
          breakdown.push({
             subject,
             total: data.total,
             correct: data.correct,
             percentage: (data.correct / data.total) * 100
          });
       }
    });

    return breakdown;
  }, [result.questions, result.subjects]);

  if (stats.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        Subject Performance
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat) => {
          // Determine color based on percentage
          const isExcellent = stat.percentage >= 75;
          const isGood = stat.percentage >= 50 && stat.percentage < 75;
          const colorClass = isExcellent 
            ? "bg-emerald-400" 
            : isGood 
              ? "bg-amber-400" 
              : "bg-red-400";

          return (
            <div key={stat.subject} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/80">
                  {stat.subject}
                </span>
                <span className="sb-mono text-xs text-white/40">
                  {stat.correct} / {stat.total}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out", colorClass)} 
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
