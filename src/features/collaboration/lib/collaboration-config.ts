import type { Subject } from "@/lib/api/exams";
import type { CollaborationQuestionSource } from "@/lib/api/types";
import {
  BookA,
  BookOpen,
  Calculator,
  Dna,
  Flame,
  FlaskConical,
  Sparkles,
  Swords,
  Target,
  type LucideIcon,
} from "lucide-react";

export const collaborationQuestionSources: Array<{
  value: CollaborationQuestionSource;
  label: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
}> = [
  {
    value: "REAL_PAST_QUESTION",
    label: "Official Past Questions",
    eyebrow: "Tournament",
    description:
      "Shared real-post-UTME pressure with the exact question discipline both players will feel.",
    icon: Sparkles,
    accentClass: "from-[var(--sb-gold)]/30 to-[#7a4a14]/20",
  },
  {
    value: "PRACTICE",
    label: "Practice Set",
    eyebrow: "Coached",
    description:
      "Warm, strategic, and ideal for focused head-to-head revision without full exam pressure.",
    icon: BookOpen,
    accentClass: "from-blue-400/25 to-cyan-400/10",
  },
  {
    value: "MIXED",
    label: "Mixed Sprint",
    eyebrow: "Chaos",
    description:
      "Fast rotation across subjects for students who want unpredictable, sharp, short-form competition.",
    icon: Flame,
    accentClass: "from-fuchsia-500/25 to-orange-400/10",
  },
];

export const collaborationSubjects: Array<{
  value: Subject;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}> = [
  {
    value: "English",
    label: "English",
    icon: BookA,
    colorClass: "text-rose-300",
  },
  {
    value: "Mathematics",
    label: "Mathematics",
    icon: Calculator,
    colorClass: "text-sky-300",
  },
  {
    value: "Physics",
    label: "Physics",
    icon: Target,
    colorClass: "text-violet-300",
  },
  {
    value: "Chemistry",
    label: "Chemistry",
    icon: FlaskConical,
    colorClass: "text-emerald-300",
  },
  {
    value: "Biology",
    label: "Biology",
    icon: Dna,
    colorClass: "text-lime-300",
  },
];

export function getQuestionSourceMeta(source: CollaborationQuestionSource) {
  return (
    collaborationQuestionSources.find((item) => item.value === source) ??
    collaborationQuestionSources[0]
  );
}

export function getCollaborationHeadline(isLocked: boolean) {
  if (isLocked) {
    return "Earn your right to enter the arena.";
  }

  return "Craft a room that feels intentional before the first question lands.";
}

export function getCollaborationStatChips(realExamsCompleted: number) {
  return [
    {
      label: "Format",
      value: "1v1 synced duel",
      icon: Swords,
    },
    {
      label: "Unlock",
      value: `${Math.min(realExamsCompleted, 2)}/2 real exams`,
      icon: Sparkles,
    },
    {
      label: "Mode",
      value: "Premium only",
      icon: Flame,
    },
  ];
}
