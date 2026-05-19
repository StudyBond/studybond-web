"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

type SubjectFilterProps = {
  subjects: string[];
  selected: string | undefined;
  onSelect: (subject: string | undefined) => void;
};

// Rich HSL academic discipline colors
const SUBJECT_COLORS: Record<string, { dot: string; glow: string }> = {
  Mathematics: { dot: "bg-blue-400", glow: "rgba(96,165,250,0.3)" },
  English: { dot: "bg-amber-400", glow: "rgba(251,191,36,0.3)" },
  Physics: { dot: "bg-cyan-400", glow: "rgba(34,211,238,0.3)" },
  Chemistry: { dot: "bg-emerald-400", glow: "rgba(52,211,153,0.3)" },
  Biology: { dot: "bg-rose-400", glow: "rgba(251,113,133,0.3)" },
};

export function SubjectFilter({ subjects, selected, onSelect }: SubjectFilterProps) {
  if (subjects.length === 0) return null;

  return (
    <div className="relative">
      {/* Scrollable Container with faded edges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 sb-scroll-hide">
        {/* All / Vault Tab */}
        <button
          onClick={() => onSelect(undefined)}
          className={cn(
            "group relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shrink-0 border outline-none",
            !selected
              ? "border-white/[0.08] text-white"
              : "border-white/[0.03] bg-white/[0.01] text-white/30 hover:border-white/[0.08] hover:text-white/60 hover:bg-white/[0.02]"
          )}
        >
          {!selected && (
            <motion.div
              layoutId="activeSubjectTab"
              className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.06] to-white/[0.01] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] pointer-events-none"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">All Subjects</span>
        </button>

        {/* Catalog dividers */}
        {subjects.map((subject) => {
          const isActive = selected === subject;
          const config = SUBJECT_COLORS[subject] || { dot: "bg-white/40", glow: "rgba(255,255,255,0.1)" };

          return (
            <button
              key={subject}
              onClick={() => onSelect(isActive ? undefined : subject)}
              className={cn(
                "group relative flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shrink-0 border outline-none",
                isActive
                  ? "border-white/[0.08] text-white"
                  : "border-white/[0.03] bg-white/[0.01] text-white/30 hover:border-white/[0.08] hover:text-white/60 hover:bg-white/[0.02]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSubjectTab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.06] to-white/[0.01] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              {/* Colored catalog tab dot */}
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full relative z-10 transition-all duration-300",
                  config.dot
                )}
                style={{
                  boxShadow: isActive ? `0 0 8px ${config.glow}` : "none"
                }}
              />
              <span className="relative z-10">{subject}</span>
            </button>
          );
        })}
      </div>
      
      {/* Subtle bottom accent line */}
      <div className="h-px w-full bg-gradient-to-r from-white/[0.04] via-transparent to-transparent mt-1" />
    </div>
  );
}

