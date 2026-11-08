"use client";

import { useEffect, useState } from "react";

import { SubjectIcon, subjectPalette } from "@/components/ui/subject-icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { DuelResultLetter } from "@/lib/api/duel";
import { cn } from "@/lib/utils/cn";

import s from "./duel.module.css";

/** "Tobi Adeyemi" -> "Tobi A.", the way the duel screens name people. */
export function shortName(fullName: string | null | undefined): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Someone";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function firstName(fullName: string | null | undefined): string {
  return (fullName ?? "").trim().split(/\s+/)[0] || "Someone";
}

/**
 * Avatars on duel screens. Until the account avatar ships on the web (the
 * Leaderboard session's Avatar component), only your own avatar can be drawn:
 * the old one lives in this browser. Everyone else gets a quiet silhouette.
 * Swap this one file when the status board says AVATAR API PUSHED.
 */
export function DuelAvatar({ self = false, size = 44, className }: { self?: boolean; size?: number; className?: string }) {
  if (self) {
    return (
      <span className={cn("inline-flex shrink-0", className)} style={{ width: size, height: size }}>
        <UserAvatar size={size >= 56 ? "xl" : size >= 44 ? "lg" : size >= 36 ? "md" : size >= 28 ? "sm" : "xs"} showRing={false} />
      </span>
    );
  }
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full", className)}
      style={{ width: size, height: size, background: "#26262d" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="rgba(255,255,255,0.28)">
        <circle cx="12" cy="9" r="4.2" />
        <path d="M3.6 22c.9-4.6 4.2-7.2 8.4-7.2s7.5 2.6 8.4 7.2Z" />
      </svg>
    </span>
  );
}

/** The mockup's subject tile: the subject's colour, soft, with its icon. */
export function SubjectTile({
  iconName,
  code,
  colorToken,
  size = 36,
}: {
  iconName?: string | null;
  code: string;
  colorToken?: string | null;
  size?: number;
}) {
  const palette = subjectPalette(colorToken);
  return (
    <span
      className={s.tile}
      style={{ width: size, height: size, background: `${palette.hex}1f`, color: palette.hex }}
      aria-hidden="true"
    >
      <SubjectIcon iconName={iconName} code={code} size={Math.round(size * 0.5)} />
    </span>
  );
}

/** A football-style form guide: W, L, D squares, oldest first. */
export function FormGuide({ form, label }: { form: DuelResultLetter[]; label?: string }) {
  const words = { W: "won", L: "lost", D: "draw" } as const;
  return (
    <span
      className={s.form}
      role="img"
      aria-label={label ?? `Last ${form.length} duels: ${form.map((result) => words[result]).join(", ")}`}
    >
      {form.map((result, index) => (
        <i key={index} className={result === "W" ? s.w : result === "L" ? s.l : s.d}>
          {result}
        </i>
      ))}
    </span>
  );
}

/** "You lead 3–2", "Tobi leads 2–1", "Level at 1–1". */
export function headToHeadLine(wins: number, losses: number, rivalFirstName: string): string {
  if (wins > losses) return `You lead ${wins}–${losses}`;
  if (losses > wins) return `${rivalFirstName} leads ${losses}–${wins}`;
  return wins === 0 ? "First duel" : `Level at ${wins}–${losses}`;
}

/** "Last duel: you won by 4 marks". */
export function lastDuelLine(
  last: { result: DuelResultLetter; myScore: number; opponentScore: number } | null,
  rivalFirstName: string,
): string {
  if (!last) return "";
  const margin = Math.abs(last.myScore - last.opponentScore);
  const marks = `${margin} mark${margin === 1 ? "" : "s"}`;
  if (last.result === "W") return `Last duel: you won by ${marks}`;
  if (last.result === "L") return `Last duel: ${rivalFirstName} won by ${marks}`;
  return `Last duel: level at ${last.myScore}`;
}

/** Re-renders every second while mounted. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** 702 -> "11:42"; 3 days -> "3d 4h". */
export function formatLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/** "Sat", or "2 Oct" for anything older than a week. */
export function shortWhen(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const days = (Date.now() - date.getTime()) / 86_400_000;
  if (days < 1 && new Date().getDate() === date.getDate()) return "Today";
  if (days < 7) return date.toLocaleDateString("en-GB", { weekday: "short" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** "K7Q4M2" -> "K7Q 4M2", the way the slip prints it. */
export function printedCode(code: string): string {
  const clean = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return clean.length === 6 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
}

export function minutesLabel(seconds: number | null | undefined): string {
  if (!seconds) return "";
  return `${Math.round(seconds / 60)} min`;
}
