"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/features/avatar/components/avatar";
import { boardSounds } from "@/features/leaderboard/lib/board-sounds";
import { firstName } from "@/features/leaderboard/lib/names";
import type { BoardEntry, BoardHeadToHead } from "@/lib/api/leaderboard";
import styles from "./leaderboard.module.css";

const fmt = (n: number) => n.toLocaleString("en-US");

/** The Duel's Challenge-a-friend setup with this student filled in. */
export function challengeHref(entry: BoardEntry): Route {
  return `/dashboard/duel/new?to=${entry.userId}&name=${encodeURIComponent(entry.displayName)}` as Route;
}

/** "You lead Tobi 3-2. You won the last one, 20-18." */
export function headToHeadText(first: string, record: BoardHeadToHead | null): string {
  const played = record ? record.wins + record.losses + record.draws : 0;
  if (!record || played === 0 || !record.lastDuel) return `You and ${first} have never duelled.`;
  const last = record.lastDuel;
  const marks = `${last.myScore}–${last.opponentScore}`;
  if (played === 1) {
    if (last.result === "W") return `You won your only duel, ${marks}.`;
    if (last.result === "L") return `${first} won your only duel, ${last.opponentScore}–${last.myScore}.`;
    return `Your only duel was a draw, ${marks}.`;
  }
  const { wins, losses, draws } = record;
  let tally = wins > losses
    ? `You lead ${first} ${wins}–${losses}`
    : losses > wins
      ? `${first} leads you ${losses}–${wins}`
      : `You are level with ${first} at ${wins}–${losses}`;
  if (draws > 0) tally += `, with ${draws} ${draws === 1 ? "draw" : "draws"}`;
  const lastLine = last.result === "W"
    ? `You won the last one, ${marks}.`
    : last.result === "L"
      ? `${first} won the last one, ${last.opponentScore}–${last.myScore}.`
      : `The last one was a draw, ${marks}.`;
  return `${tally}. ${lastLine}`;
}

type SheetProps = {
  entry: BoardEntry | null;
  /** The viewer's points on this board, for the gap. */
  myPoints: number;
  /** "this week", "in your course" */
  rankLabel: string;
  /** undefined: the server sent no duel records, so say nothing about duels. */
  record: BoardHeadToHead | null | undefined;
  onClose: () => void;
};

/* Tap a student on the board (mockup screen 7): who they are, the gap, your
   duel record with them and a way to challenge them. The challenge itself is
   set up on the Duel page (subjects, taster, time), never here, so the board
   stays uncluttered. A native <dialog>: it sits above everything (the shell's
   transformed wrapper can't trap it), keeps focus inside, closes on Escape
   and gives focus back to the row. */
export function RowSheet({ entry, myPoints, rankLabel, record, onClose }: Readonly<SheetProps>) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (entry && !dialog.open) dialog.showModal();
    if (!entry && dialog.open) dialog.close();
  }, [entry]);

  const first = entry ? firstName(entry.displayName) : "";
  const gap = entry ? entry.points - myPoints : 0;
  const challenge = record?.challenge ?? null;

  return (
    <dialog
      ref={ref}
      aria-label={entry?.displayName ?? "Student"}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog itself (not its content) is the dimmed backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
      className={styles.sheet}
    >
      {entry ? (
        <div className="px-[18px] pb-[18px] pt-5">
          <div className="flex items-center gap-3.5">
            <Avatar look={entry.avatar} size={64} label={`${entry.displayName}'s avatar`} />
            <div className="grid min-w-0">
              <b className={cn(styles.head, "truncate text-xl font-extrabold")}>{entry.displayName}</b>
              {entry.subtitle ? <span className="truncate text-[13px] text-[var(--ink-3)]">{entry.subtitle}</span> : null}
            </div>
          </div>

          <dl className={cn(styles.stats, "my-4 grid grid-cols-3 border-y border-[var(--rule)]")}>
            <Stat value={`#${entry.rank}`} label={rankLabel} />
            <Stat value={fmt(entry.points)} label="SP this week" />
            <Stat
              value={gap > 0 ? `+${fmt(gap)}` : fmt(Math.abs(gap))}
              label={gap > 0 ? "SP ahead of you" : gap < 0 ? "SP behind you" : "level with you"}
            />
          </dl>

          {record !== undefined ? (
            <p className="mb-3.5 text-sm text-[var(--ink-2)]">
              {/* A waiting challenge says enough on its own when you've never duelled. */}
              {challenge === "FROM_THEM" && !record?.lastDuel
                ? `${first} has challenged you. It is waiting on your Duel page.`
                : `${headToHeadText(first, record)}${challenge === "FROM_THEM" ? ` ${first} has challenged you. It is waiting on your Duel page.` : ""}`}
            </p>
          ) : null}
          {challenge === "FROM_YOU" ? (
            <p className="mb-3 rounded-[10px] bg-[var(--ui-good-soft)] px-3 py-2.5 text-[13.5px]">
              Your challenge to {first} is waiting for an answer.
            </p>
          ) : null}

          <div className="grid grid-cols-[1fr_1.4fr] gap-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(styles.btn, styles.btnLine)}
            >
              Close
            </button>
            {challenge === "FROM_YOU" ? (
              <button
                type="button"
                disabled
                className={cn(styles.btn, styles.btnInk)}
              >
                Sent
              </button>
            ) : (
              <Link
                href={challenge === "FROM_THEM" ? ("/dashboard/duel" as Route) : challengeHref(entry)}
                onClick={() => boardSounds.pop()}
                className={cn(styles.btn, styles.btnInk)}
              >
                <span className="truncate">{challenge === "FROM_THEM" ? `See ${first}'s challenge` : `Challenge ${first}`}</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid py-2.5">
      <dt className="order-2 text-xs text-[var(--ink-3)]">{label}</dt>
      <dd className={cn(styles.num, "order-1 text-[17px] font-bold")}>{value}</dd>
    </div>
  );
}
