"use client";

import { cn } from "@/lib/utils/cn";

type SubjectFilterProps = {
  subjects: string[];
  selected: string | undefined;
  onSelect: (subject: string | undefined) => void;
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "from-blue-400 to-blue-600",
  English: "from-purple-400 to-purple-600",
  Physics: "from-cyan-400 to-cyan-600",
  Chemistry: "from-emerald-400 to-emerald-600",
  Biology: "from-rose-400 to-rose-600",
};

export function SubjectFilter({ subjects, selected, onSelect }: SubjectFilterProps) {
  if (subjects.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sb-scroll-hide">
      {/* All pill */}
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0",
          !selected
            ? "bg-[var(--sb-accent)]/15 text-[var(--sb-accent)] ring-1 ring-[var(--sb-accent)]/25 shadow-[0_0_12px_var(--sb-accent-glow)]"
            : "bg-white/[0.02] text-white/30 hover:bg-white/[0.05] hover:text-white/50",
        )}
      >
        All
      </button>

      {/* Subject pills */}
      {subjects.map((subject) => {
        const isActive = selected === subject;
        return (
          <button
            key={subject}
            onClick={() => onSelect(isActive ? undefined : subject)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0",
              isActive
                ? "bg-[var(--sb-accent)]/15 text-[var(--sb-accent)] ring-1 ring-[var(--sb-accent)]/25"
                : "bg-white/[0.02] text-white/30 hover:bg-white/[0.05] hover:text-white/50",
            )}
          >
            {/* Color dot */}
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-gradient-to-br shrink-0",
                SUBJECT_COLORS[subject] || "from-gray-400 to-gray-600",
              )}
            />
            {subject}
          </button>
        );
      })}
    </div>
  );
}
