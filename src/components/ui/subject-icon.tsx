"use client";

import {
  Atom,
  Banknote,
  BookA,
  BookMarked,
  BookOpen,
  Brain,
  Calculator,
  Coins,
  Cpu,
  Dna,
  FlaskConical,
  Gavel,
  Globe,
  HeartPulse,
  Landmark,
  Languages,
  Leaf,
  Map as MapIcon,
  Microscope,
  Music,
  Palette,
  Scale,
  Scroll,
  Sigma,
  TestTube,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Subjects come from the backend now, so a school can add one we have never
 * designed for. Two things keep that safe:
 *
 *   - an icon we do not recognise falls back to a small badge showing the
 *     subject's short code, e.g. ECO, rather than a missing or wrong picture;
 *   - a colour we do not recognise falls back to a neutral slate.
 *
 * Both class strings are written out in full below, so Tailwind keeps them in
 * the build. Never build these names by joining strings.
 */
const ICONS: Record<string, LucideIcon> = {
  "book-a": BookA,
  "book-open": BookOpen,
  "book-marked": BookMarked,
  calculator: Calculator,
  sigma: Sigma,
  atom: Atom,
  "flask-conical": FlaskConical,
  "test-tube": TestTube,
  dna: Dna,
  microscope: Microscope,
  leaf: Leaf,
  "heart-pulse": HeartPulse,
  brain: Brain,
  cpu: Cpu,
  landmark: Landmark,
  gavel: Gavel,
  scale: Scale,
  scroll: Scroll,
  coins: Coins,
  banknote: Banknote,
  globe: Globe,
  map: MapIcon,
  languages: Languages,
  music: Music,
  palette: Palette,
};

export interface SubjectPalette {
  /** Text colour, e.g. for an icon. */
  text: string;
  /** Solid fill, e.g. for a status dot. */
  dot: string;
  /** Gradient pair, e.g. for the filter pills on the bookmarks screen. */
  gradient: string;
  /** Raw colour, for inline styles that cannot take a class. */
  hex: string;
  /** Translucent version of the same colour, for glows. */
  glow: string;
}

const PALETTE: Record<string, SubjectPalette> = {
  rose: { text: "text-rose-400", dot: "bg-rose-400", gradient: "from-rose-400 to-rose-600", hex: "#fb7185", glow: "rgba(251, 113, 133, 0.15)" },
  sky: { text: "text-sky-400", dot: "bg-sky-400", gradient: "from-sky-400 to-sky-600", hex: "#38bdf8", glow: "rgba(56, 189, 248, 0.15)" },
  blue: { text: "text-blue-400", dot: "bg-blue-400", gradient: "from-blue-400 to-blue-600", hex: "#60a5fa", glow: "rgba(96, 165, 250, 0.15)" },
  violet: { text: "text-violet-400", dot: "bg-violet-400", gradient: "from-violet-400 to-violet-600", hex: "#a78bfa", glow: "rgba(167, 139, 250, 0.15)" },
  indigo: { text: "text-indigo-400", dot: "bg-indigo-400", gradient: "from-indigo-400 to-indigo-600", hex: "#818cf8", glow: "rgba(129, 140, 248, 0.15)" },
  purple: { text: "text-purple-400", dot: "bg-purple-400", gradient: "from-purple-400 to-purple-600", hex: "#c084fc", glow: "rgba(192, 132, 252, 0.15)" },
  fuchsia: { text: "text-fuchsia-400", dot: "bg-fuchsia-400", gradient: "from-fuchsia-400 to-fuchsia-600", hex: "#e879f9", glow: "rgba(232, 121, 249, 0.15)" },
  emerald: { text: "text-emerald-400", dot: "bg-emerald-400", gradient: "from-emerald-400 to-emerald-600", hex: "#34d399", glow: "rgba(52, 211, 153, 0.15)" },
  green: { text: "text-green-400", dot: "bg-green-400", gradient: "from-green-400 to-green-600", hex: "#4ade80", glow: "rgba(74, 222, 128, 0.15)" },
  lime: { text: "text-lime-400", dot: "bg-lime-400", gradient: "from-lime-400 to-lime-600", hex: "#a3e635", glow: "rgba(163, 230, 53, 0.15)" },
  teal: { text: "text-teal-400", dot: "bg-teal-400", gradient: "from-teal-400 to-teal-600", hex: "#2dd4bf", glow: "rgba(45, 212, 191, 0.15)" },
  cyan: { text: "text-cyan-400", dot: "bg-cyan-400", gradient: "from-cyan-400 to-cyan-600", hex: "#22d3ee", glow: "rgba(34, 211, 238, 0.15)" },
  amber: { text: "text-amber-400", dot: "bg-amber-400", gradient: "from-amber-400 to-amber-600", hex: "#fbbf24", glow: "rgba(251, 191, 36, 0.15)" },
  orange: { text: "text-orange-400", dot: "bg-orange-400", gradient: "from-orange-400 to-orange-600", hex: "#fb923c", glow: "rgba(251, 146, 60, 0.15)" },
  slate: { text: "text-slate-300", dot: "bg-slate-300", gradient: "from-slate-400 to-slate-600", hex: "#cbd5e1", glow: "rgba(203, 213, 225, 0.15)" },
};

const NEUTRAL = PALETTE.slate;

/** Colours for a subject. Falls back to neutral slate for an unknown token. */
export function subjectPalette(colorToken?: string | null): SubjectPalette {
  if (!colorToken) return NEUTRAL;
  return PALETTE[colorToken] ?? NEUTRAL;
}

/** True when we have a real icon, false when the code badge will be shown. */
export function hasSubjectIcon(iconName?: string | null): boolean {
  return Boolean(iconName && ICONS[iconName]);
}

export interface SubjectIconProps {
  /** Backend icon key, e.g. "flask-conical". */
  iconName?: string | null;
  /** Short code, e.g. "ENG". Shown when the icon is unknown. */
  code: string;
  className?: string;
  /** Pixel size of the icon. The badge scales to match. */
  size?: number;
}

/**
 * A subject's icon, or its short code when we have no icon for it.
 *
 * `className` should carry the colour, normally from subjectPalette().text.
 */
export function SubjectIcon({ iconName, code, className, size = 20 }: SubjectIconProps) {
  const Icon = iconName ? ICONS[iconName] : undefined;

  if (Icon) {
    return <Icon className={cn(className)} size={size} aria-hidden="true" />;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-current/30 font-semibold uppercase leading-none tracking-wide",
        className,
      )}
      style={{ width: size + 6, height: size + 6, fontSize: Math.max(9, Math.round(size * 0.42)) }}
      aria-hidden="true"
    >
      {code.slice(0, 3)}
    </span>
  );
}
