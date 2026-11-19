"use client";

import type { CSSProperties, ReactNode } from "react";
import { MoreHorizontal, WifiOff } from "lucide-react";

import { useExamStore } from "@/features/exam/stores/exam-store";
import {
  answeredInPaper,
  formatClock,
  paperLabel,
  paperOfIndex,
  secondsInPaper,
} from "@/features/exam/lib/papers";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/features/exam/hooks/use-exam-tick";

import s from "./exam-shell.module.css";

const TIER_CLASS = {
  normal: "",
  warning: s.tierWarning,
  critical: s.tierCritical,
  final: s.tierFinal,
  expired: s.tierExpired,
} as const;

type PaperRailProps = {
  questionIds: number[];
  /** One tint per paper (already flattened to amber if paper colour is off). */
  tints: string[];
  timeAllowedSeconds: number;
  isOnline: boolean;
  /** The rival pill (desktop) and chip (phone), in a duel or ghost race. */
  rivalPill: ReactNode;
  rivalChip: ReactNode;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onSubmit: () => void;
  onGoToPaper: (paper: number) => void;
  /** The ... menu, positioned under the rail. */
  menu: ReactNode;
};

/**
 * The top band: every paper at once. Each shows answered/total, minutes
 * spent, and a tick at its fair share of the clock. Past the tick the bar
 * turns gold. The rival pill, the clock, the ... menu and Submit sit at the end.
 */
export function PaperRail({
  questionIds,
  tints,
  timeAllowedSeconds,
  isOnline,
  rivalPill,
  rivalChip,
  menuOpen,
  onToggleMenu,
  onSubmit,
  onGoToPaper,
  menu,
}: PaperRailProps) {
  const ranges = useExamStore((st) => st.subjectRanges);
  const states = useExamStore((st) => st.questionStates);
  const currentIndex = useExamStore((st) => st.currentIndex);
  const remaining = useExamStore((st) => st.remainingSeconds);
  const tier = useExamStore((st) => st.timerTier);

  const now = useNow();
  const papers = Math.max(1, ranges.length);
  const budget = timeAllowedSeconds / papers;
  const barScale = budget * 1.5;
  const current = paperOfIndex(ranges, currentIndex);

  let answeredAll = 0;
  states.forEach((q) => {
    if (q.answer) answeredAll++;
  });
  const left = questionIds.length - answeredAll;

  const clockNote = (short: boolean) =>
    !isOnline ? (
      <span className={s.offline}>
        <WifiOff aria-hidden="true" />
        {short ? "Offline · saved here" : "Offline · answers saved on this device"}
      </span>
    ) : (
      <span>{short ? `${left} left` : `left for ${left} question${left === 1 ? "" : "s"}`}</span>
    );

  const tabs = ranges.map((range, k) => {
    const spent = secondsInPaper(range, questionIds, states, now);
    const over = spent > budget;
    const done = answeredInPaper(range, questionIds, states);
    const mins = Math.round(spent / 60);
    return (
      <button
        key={range.subject}
        type="button"
        className={cn(s.tab, over && s.over)}
        style={{ "--tint": tints[k] } as CSSProperties}
        aria-current={k === current}
        onClick={() => onGoToPaper(k)}
        aria-label={`${paperLabel(range.subject)}: ${done} of ${range.count} answered, ${mins} minutes spent${over ? ", over its share of the time" : ""}`}
      >
        <span className={s.tabTop}>
          <span className={s.tabName}>
            <i className={s.dot} />
            {paperLabel(range.subject)}
          </span>
          <span className={s.tabCount}>
            <b>{done}</b>/{range.count}
          </span>
        </span>
        <span className={s.tabBar} aria-hidden="true">
          <i className={s.tabFill} style={{ width: `${Math.min(100, (spent / barScale) * 100)}%` }} />
          <s className={s.tabTick} style={{ left: `${(budget / barScale) * 100}%` }} />
        </span>
        <span className={s.mins}>
          {mins} min{over ? " · over" : ""}
        </span>
      </button>
    );
  });

  return (
    <div className={cn(TIER_CLASS[tier])} style={{ position: "relative" }}>
      <div className={s.rail}>
        {tabs}
        <span className={s.railSep} />
        <div className={s.railEnd}>
          {rivalPill}
          <div className={s.clock}>
            <b role="timer" aria-live="off">{formatClock(remaining)}</b>
            {clockNote(false)}
          </div>
          <button
            type="button"
            className={s.iconBtn}
            onClick={onToggleMenu}
            aria-label="Exam tools"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal aria-hidden="true" />
          </button>
          <button type="button" className={cn(s.btn, s.btnPrimary)} onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>

      <div className={s.phoneRail}>
        <div className={s.clock}>
          <b role="timer" aria-live="off">{formatClock(remaining)}</b>
          {clockNote(true)}
        </div>
        <div className={s.phonePapers}>
          {rivalChip}
          {ranges.map((range, k) => (
            <button
              key={range.subject}
              type="button"
              className={s.pchip}
              style={{ "--tint": tints[k] } as CSSProperties}
              aria-current={k === current}
              onClick={() => onGoToPaper(k)}
            >
              <i className={s.dot} />
              {paperLabel(range.subject)} {answeredInPaper(range, questionIds, states)}/{range.count}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={s.iconBtn}
          onClick={onToggleMenu}
          aria-label="Exam tools"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal aria-hidden="true" />
        </button>
      </div>

      {menu}
    </div>
  );
}
