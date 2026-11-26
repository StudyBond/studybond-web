"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";

import { getDashboardHome, homeKeys } from "@/features/home/api";
import { paperTitle, thousands, whenLine, lagosKey } from "@/features/home/format";
import { cn } from "@/lib/utils/cn";

import { useLastPaper } from "../use-last-paper";
import s from "./last-paper.module.css";

const DUEL_TYPES = new Set(["ONE_V_ONE_DUEL", "GROUP_COLLAB", "GHOST_RACE"]);

/**
 * Practice's way in to Past papers (canvas board 3, option 2): the last paper
 * sent, its marks, and a link to the whole file. Hidden until there is one.
 */
export function LastPaperCard({ className }: { className?: string }) {
  const q = useLastPaper();
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const p = q.data?.last;
  if (!p) return null;

  const today = lagosKey(home.data?.serverNow ?? new Date().toISOString());
  const duel = DUEL_TYPES.has(p.examType) ? { opponentName: p.duel?.opponentName ?? "a friend" } : null;
  const title = p.examType === "DAILY_CHALLENGE"
    ? "Daily challenge"
    : paperTitle({ examType: p.examType, subjects: p.subjects, duel });
  const marks = p.marks ?? "";
  const cells = marks.length <= 60 ? marks.split("").map((m) => (m === "1" ? 1 : 0)) : Array.from({ length: 30 }, (_, i) => {
    const part = marks.slice(Math.floor((i * marks.length) / 30), Math.floor(((i + 1) * marks.length) / 30));
    return part.length ? part.split("").filter((m) => m === "1").length / part.length : 0;
  });
  const href = (p.duelSessionCode ? `/exams/${p.id}/results?duel=${p.duelSessionCode}` : `/exams/${p.id}/results`) as Route;

  return (
    <section className={cn(s.card, className)} aria-label="Your last paper">
      <Link href={href} className={s.top}>
        <span className={s.ico} aria-hidden="true">{p.subjects.length === 1 ? p.subjects[0].slice(0, 2) : p.subjects.length}</span>
        <span className={s.t}>
          <b>{title}</b>
          {cells.length ? (
            <span className={s.ticks} style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }} aria-hidden="true">
              {cells.map((v, i) => <i key={i} className={v >= 1 ? s.on : ""} style={v > 0 && v < 1 ? { background: `rgba(193, 122, 40, ${0.25 + v * 0.75})` } : undefined} />)}
            </span>
          ) : null}
          <small>Your last paper · {whenLine(p.completedAt ?? p.startedAt, today)}</small>
        </span>
        <span className={s.sc}><b>{Math.round(p.percentage)}%</b><small>{p.score}/{p.totalQuestions}</small></span>
      </Link>
      <div className={s.foot}>
        <span>See every answer, or retake it</span>
        <Link href={"/dashboard/history" as Route}>All {thousands(q.data!.total)} paper{q.data!.total === 1 ? "" : "s"}</Link>
      </div>
    </section>
  );
}
