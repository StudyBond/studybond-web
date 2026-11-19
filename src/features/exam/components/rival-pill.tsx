"use client";

import { useEffect, useRef, useState } from "react";

import { DUEL_REACTIONS, type IncomingReaction } from "@/features/duel/race/duel-race";
import { firstName } from "@/features/duel/ui/parts";
import { playDuelSound } from "@/features/duel/ui/sfx";
import { cn } from "@/lib/utils/cn";

import s from "./exam-shell.module.css";

const COOL_SECONDS = 5;
const SHOW_MS = 2600;

type RivalPillProps = {
  rivalName: string;
  /** Global 0-based index of the rival's question; null until the first update. */
  rivalIndex: number | null;
  rivalFinished: boolean;
  myIndex: number;
  /** "Bio 17" for a global index. */
  placeOf: (index: number) => string;
  incoming: IncomingReaction | null;
  /** Null hides the reactions (a ghost can't hear them). */
  onReact: ((key: string) => void) | null;
  variant: "pill" | "chip";
};

/**
 * In a duel or ghost race, the rival lives in the rail: initial, first name,
 * where they are and the gap. Tap it to send one of the six reactions; one
 * you receive shows on the pill for a moment. Their position is also drawn
 * on the ribbon (see RibbonCells).
 */
export function RivalPill({
  rivalName,
  rivalIndex,
  rivalFinished,
  myIndex,
  placeOf,
  incoming,
  onReact,
  variant,
}: RivalPillProps) {
  const name = firstName(rivalName);
  const initial = name.charAt(0).toUpperCase();
  const [open, setOpen] = useState(false);
  const [cool, setCool] = useState(0);
  const [says, setSays] = useState<string | null>(null);
  const lastIncoming = useRef<string | null>(null);

  useEffect(() => {
    if (!incoming || incoming.id === lastIncoming.current) return;
    lastIncoming.current = incoming.id;
    if (variant === "pill") playDuelSound("react");
    const show = window.setTimeout(() => setSays(incoming.label), 0);
    const hide = window.setTimeout(() => setSays(null), SHOW_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [incoming, variant]);

  useEffect(() => {
    if (cool <= 0) return;
    const t = window.setTimeout(() => setCool((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [cool]);

  function send(key: string) {
    if (cool > 0 || !onReact) return;
    playDuelSound("react");
    onReact(key);
    setCool(COOL_SECONDS);
    setOpen(false);
  }

  const gap = rivalIndex === null ? null : rivalIndex - myIndex;
  const gapText = rivalFinished ? "done" : gap === null ? "…" : gap === 0 ? "level" : gap > 0 ? `+${gap}` : `${gap}`;
  const where = rivalFinished ? "submitted" : rivalIndex === null ? "starting" : placeOf(rivalIndex);
  const title = rivalFinished
    ? `${name} has submitted. Take your time: marks win, not speed.`
    : rivalIndex === null
      ? `Waiting for ${name}`
      : `${name} is on ${placeOf(rivalIndex)}`;

  if (variant === "chip") {
    return (
      <span className={cn(s.pchip, s.rivalChip)} title={title}>
        <i className={s.dot} style={{ background: "var(--rival)" }} />
        {says ?? `${initial} ${rivalFinished ? "done" : rivalIndex === null ? "…" : placeOf(rivalIndex).split(" ").pop()}`}
      </span>
    );
  }

  const inner = (
    <>
      <span className={s.rivalInitial} aria-hidden="true">
        {initial}
      </span>
      <span className={s.rivalName}>{name}</span>
      {says ? (
        <span className={s.rivalSays} role="status">
          {says}
        </span>
      ) : (
        <>
          <span className={s.rivalAt}>{where}</span>
          <span className={s.rivalGap}>{gapText}</span>
        </>
      )}
    </>
  );

  if (!onReact) {
    return (
      <span className={s.rivalPill} title={title}>
        {inner}
      </span>
    );
  }

  return (
    <div className={s.rivalWrap}>
      <button
        type="button"
        className={s.rivalPill}
        title={`${title}. Tap to react.`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {inner}
      </button>
      {open ? (
        <>
          <div className={s.menuScrim} onClick={() => setOpen(false)} />
          <div className={s.tray} role="menu" aria-label={`React to ${name}`}>
            <span className={s.trayNote}>{cool > 0 ? `Wait ${cool}s to send another` : `Send ${name} a reaction`}</span>
            {DUEL_REACTIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                role="menuitem"
                className={s.trayBtn}
                disabled={cool > 0}
                onClick={() => send(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
