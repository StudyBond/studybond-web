"use client";

import { useExamHistory } from "@/features/history/hooks/use-exam-history";
import { ExamCard } from "@/features/history/components/exam-card";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { Loader2, SearchX, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ExamType } from "@/lib/api/exams";

function CustomSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onValueChange: (val: string) => void; 
  options: { label: string; value: string }[]; 
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/[0.04] outline-none",
          isOpen && "ring-2 ring-[var(--sb-accent)]/50 border-transparent"
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/[0.08] bg-[#1a1a1a] shadow-2xl overflow-hidden py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer items-center px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 select-none",
                  value === option.value && "bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]"
                )}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <div className="flex-1 truncate">{option.label}</div>
                {value === option.value && <Check className="h-4 w-4 shrink-0" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function HistoryList() {
  const [examType, setExamType] = useState<ExamType | "ALL">("ALL");
  const [status, setStatus] = useState<string | "ALL">("COMPLETED");

  const { data: history, isLoading, isError, error } = useExamHistory({
    page: 1,
    limit: 20, // Keep 20 items per page for now
    examType,
    status
  });

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="flex-1 sm:max-w-[200px]">
             <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5 ml-1">Exam Type</label>
             <CustomSelect
               value={examType}
               onValueChange={(val) => setExamType(val as any)}
               options={[
                 { label: "All Types", value: "ALL" },
                 { label: "Practice", value: "PRACTICE" },
                 { label: "Past Questions", value: "REAL_PAST_QUESTION" }
               ]}
               placeholder="All Types"
             />
          </div>
          <div className="flex-1 sm:max-w-[200px]">
             <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5 ml-1">Status</label>
             <CustomSelect
               value={status}
               onValueChange={(val) => setStatus(val as any)}
               options={[
                 { label: "Completed", value: "COMPLETED" },
                 { label: "Abandoned", value: "ABANDONED" },
                 { label: "All Statuses", value: "ALL" }
               ]}
               placeholder="Completed"
             />
          </div>
       </div>

       {/* Content */}
       <div className="min-h-[400px]">
          {isLoading && (
             <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
             </div>
          )}

          {isError && (
             <div className="flex h-64 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.02] p-6 text-center shadow-lg">
                <div className="space-y-2">
                  <p className="text-red-400 font-bold text-sm">Failed to load exam history</p>
                  <p className="text-red-400/60 text-xs font-mono bg-black/40 p-2 rounded overflow-x-auto max-w-xs">{error instanceof Error ? error.message : "Unknown error"}</p>
                </div>
             </div>
          )}

          {!isLoading && !isError && history?.exams.length === 0 && (
             <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-center">
                <SearchX className="mb-4 h-10 w-10 text-white/20" />
                <h3 className="mb-1 text-lg font-bold text-white/80">No history found</h3>
                <p className="text-sm text-white/40">You haven't taken any exams that match these filters.</p>
             </div>
          )}

          {!isLoading && !isError && history && history.exams.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.exams.map((exam) => (
                   <ExamCard key={exam.id} exam={exam} />
                ))}
             </div>
          )}
       </div>
    </div>
  );
}
