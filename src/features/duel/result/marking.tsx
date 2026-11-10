"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { DuelAvatar } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import type { Outcome, SubjectRow } from "./outcome-data";
import m from "./result.module.css";

const SUBJECT_GAP_MS = 2100;

/**
 * Marking (mockup board 5). Waits while the rival is still writing, then
 * marks one subject at a time: tick strips, the running score counting up,
 * a tug-of-war lead bar, and "Full time." at the end.
 */
export function Marking({
  title,
  rival,
  waiting,
  rivalIn,
  rivalQuestion,
  total,
  myTimeLeft,
  rows,
  outcome,
  summary,
  onDone,
}: {
  title: string;
  rival: string;
  /** The rival is still writing. */
  waiting: boolean;
  /** The rival has submitted but the duel isn't marked yet. */
  rivalIn: boolean;
  rivalQuestion: number | null;
  total: number;
  /** "11:06", or null when the clock ran out. */
  myTimeLeft: string | null;
  /** Null until both papers are marked. */
  rows: SubjectRow[] | null;
  outcome: Outcome | null;
  summary: string;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(0);
  const [display, setDisplay] = useState({ you: 0, them: 0 });
  const started = useRef(false);
  const timers = useRef<number[]>([]);
  const subjectCount = rows?.length ?? 0;

  const target = rows
    ? rows.slice(0, shown).reduce((acc, row) => ({ you: acc.you + row.mine, them: acc.them + row.theirs }), { you: 0, them: 0 })
    : { you: 0, them: 0 };
  const done = Boolean(rows) && shown >= (rows?.length ?? 0) && shown > 0;

  // Reveal one subject at a time once both papers are marked. The timers
  // live for the whole screen: re-renders (polling, the clock) must not stop them.
  useEffect(() => {
    if (subjectCount === 0 || started.current) return;
    started.current = true;
    for (let index = 0; index < subjectCount; index++) {
      timers.current.push(
        window.setTimeout(() => {
          playDuelSound("tick");
          setShown(index + 1);
        }, 500 + index * SUBJECT_GAP_MS),
      );
    }
    timers.current.push(window.setTimeout(() => playDuelSound("whistle"), 500 + (subjectCount - 1) * SUBJECT_GAP_MS + 1200));
  }, [subjectCount]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  // The big score counts up towards the marked total.
  useEffect(() => {
    if (display.you === target.you && display.them === target.them) return;
    const timer = window.setTimeout(() => {
      setDisplay((current) => ({
        you: current.you + Math.sign(target.you - current.you),
        them: current.them + Math.sign(target.them - current.them),
      }));
    }, 45);
    return () => window.clearTimeout(timer);
  }, [display, target.you, target.them]);

  const diff = target.you - target.them;
  const pull = (Math.min(Math.abs(diff), 10) / 10) * 50;
  let lead = "";
  let leadClass = "";
  if (shown > 0) {
    if (done && outcome) {
      lead = outcome === "W" ? `You won by ${diff}` : outcome === "L" ? `${rival} won by ${-diff}` : `Level at ${target.you}`;
    } else if (diff > 0) lead = `You lead by ${diff}`;
    else if (diff < 0) lead = `${rival} leads by ${-diff}`;
    else lead = `Level at ${target.you}`;
    leadClass = diff > 0 ? m.leadY : diff < 0 ? m.leadR : "";
  }

  return (
    <div>
      <header className={s.top} style={{ paddingLeft: 14 }}>
        <h1 className={s.topTitle}>{title}</h1>
        <button type="button" className={m.topBtn} onClick={onDone}>
          {rows ? "Skip" : "See the result later"}
        </button>
      </header>

      <section className={m.board} aria-label="Running score">
        <div className={m.boardRow}>
          <div className={m.side}>
            <div className={m.ringY}><DuelAvatar self size={36} /></div>
            <b>You</b>
          </div>
          <div className={m.score} aria-live="polite">
            <span>{display.you}</span>
            <i>–</i>
            <span>{display.them}</span>
          </div>
          <div className={cn(m.side, m.sideR)}>
            <b>{rival}</b>
            <div className={m.ringR}><DuelAvatar size={36} /></div>
          </div>
        </div>
        <div className={m.tug} aria-hidden="true">
          <div
            className={m.tugPull}
            style={{
              left: `${diff > 0 ? 50 - pull : 50}%`,
              width: `${pull}%`,
              background: diff > 0 ? "var(--ui-you)" : "var(--ui-rival)",
            }}
          />
          <div className={m.tugMid} />
        </div>
        <div className={m.tugLabels} aria-hidden="true">
          <span>You ahead</span>
          <span>{rival} ahead</span>
        </div>
        <p className={cn(m.lead, leadClass)}>{lead}</p>
      </section>

      <div className={m.body}>
        {!rows ? (
          <div className={m.wait}>
            <div className={m.dots} aria-hidden="true"><i /><i /><i /></div>
            <b>{waiting && !rivalIn ? `${rival} is still writing` : `${rival} has submitted`}</b>
            {waiting && !rivalIn && (
              <div className={m.prog} aria-hidden="true">
                <i style={{ width: `${rivalQuestion ? Math.min(100, (rivalQuestion / total) * 100) : 0}%` }} />
              </div>
            )}
            <p>
              {waiting && !rivalIn
                ? `${rivalQuestion ? `${rival} is on question ${rivalQuestion} of ${total}. ` : ""}${myTimeLeft ? `You submitted with ${myTimeLeft} left.` : "Your paper is in."}`
                : "Both papers are in. Marking starts now."}
            </p>
          </div>
        ) : (
          <>
            <p className={m.status}>Both papers are in. Marking {rows.length > 1 ? "one subject at a time" : "the paper"}.</p>
            {rows.slice(0, shown).map((row) => (
              <SubjectStrip key={row.name} row={row} rival={rival} />
            ))}
            {done && (
              <div className={m.full}>
                <p className={m.ft}>Full time.</p>
                <p>{summary}</p>
                <button type="button" className={cn(s.btn, s.ink, s.wide)} style={{ minHeight: 52 }} onClick={onDone}>
                  See your result
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SubjectStrip({ row, rival }: { row: SubjectRow; rival: string }) {
  const winText = row.mine > row.theirs ? `You took it by ${row.mine - row.theirs}` : row.theirs > row.mine ? `${rival} took it by ${row.theirs - row.mine}` : "Level";
  const winClass = row.mine > row.theirs ? m.y : row.theirs > row.mine ? m.r : "";
  // Locked picks: show how many, not which.
  const theirs = row.theirMarks ?? Array.from({ length: row.total }, (_, index) => index < row.theirs);
  return (
    <div className={m.subj}>
      <div className={m.subjHead}>
        <b>{row.name}</b>
        <span className={winClass}>{winText}</span>
      </div>
      <Strip who="You" marks={row.myMarks} count={row.mine} className={m.stripY} />
      <Strip who={rival} marks={theirs} count={row.theirs} className={m.stripR} />
    </div>
  );
}

function Strip({ who, marks, count, className }: { who: string; marks: boolean[]; count: number; className: string }) {
  return (
    <div className={cn(m.strip, className)}>
      <span className={m.who}>{who}</span>
      <div className={m.ticks} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${marks.length}, minmax(0, 1fr))` }}>
        {marks.map((right, index) => (
          <i key={index} className={right ? m.c : undefined} style={{ animationDelay: `${index * Math.min(22, 550 / marks.length)}ms` }} />
        ))}
      </div>
      <span className={m.n}>{count}</span>
    </div>
  );
}
