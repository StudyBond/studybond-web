"use client";

import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { subjectPalette } from "@/components/ui/subject-icon";
import { cn } from "@/lib/utils/cn";

type SubjectFilterProps = {
  subjects: string[];
  selected: string | undefined;
  onSelect: (subject: string | undefined) => void;
};

export function SubjectFilter({ subjects, selected, onSelect }: SubjectFilterProps) {
  /* The colour of each pill comes from the institution's own subject list, so
     a school we have never designed for still gets sensible colours. */
  const { data: examProfile } = useExamProfile();

  const colorTokenByName = new Map(
    (examProfile?.subjects ?? []).map((subject) => [
      subject.name.toLowerCase(),
      subject.colorToken,
    ]),
  );

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
        const palette = subjectPalette(colorTokenByName.get(subject.toLowerCase()));
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
                palette.gradient,
              )}
            />
            {subject}
          </button>
        );
      })}
    </div>
  );
}
