"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useDuelFull, useRematch } from "@/features/duel/hooks/use-duel-play";
import type { DuelHome, DuelSessionFull, HeadToHead } from "@/lib/api/duel";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { BackIcon, ChevronRight } from "../ui/icons";
import { DuelAvatar, FormGuide, apiErrorMessage, formatLeft, useNow } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import { headline, type Outcome, type SubjectRow } from "./outcome-data";
import m from "./result.module.css";

const FREE_COPY: Record<Outcome, { head: (rival: string) => string; text: (rival: string) => string; button: string }> = {
  W: {
    head: () => "You won your free duel",
    text: (rival) => `${rival} already wants those marks back. Your next free duel is on Sunday, or defend your win right now.`,
    button: "Defend my win now",
  },
  L: {
    head: (rival) => `${rival} took this one`,
    text: (rival) => `${rival} won't let you hear word now. Get your revenge right away, or come back stronger on Sunday.`,
    button: "Get my revenge now",
  },
  D: {
    head: () => "Level. Nobody won.",
    text: () => "That was your free duel this week. Settle it right away, or on Sunday.",
    button: "Settle it now",
  },
};

const NUDGE: Record<Outcome, (rival: string, h2h: HeadToHead | null) => string> = {
  W: (rival) => `${rival} will want this back. Go again while it's fresh?`,
  L: (rival, h2h) => (h2h && h2h.wins === h2h.losses && h2h.wins > 0 ? `You're level at ${h2h.wins}–${h2h.losses}. One more settles it.` : `Want another go at ${rival}?`),
  D: () => "Nobody won that one. Decide it now?",
};

function h2hTitle(rival: string, h2h: HeadToHead | null) {
  if (!h2h) return `First duel with ${rival}`;
  const { wins, losses, draws } = h2h;
  if (wins > losses) return `You lead ${rival} ${wins}–${losses}`;
  if (losses > wins) return `${rival} leads ${losses}–${wins}`;
  if (wins === 0) return `Level with ${rival}, ${draws} draw${draws === 1 ? "" : "s"}`;
  return `Level with ${rival} at ${wins}–${losses}`;
}

/**
 * The duel result (mockup 6a / 6b, and 12c after a free duel): the stamp,
 * the scoreline, how it turned, the subject table, what the duel did (SP
 * under the win rule, the win run, the head-to-head, this week's place),
 * then rematch, review and share.
 */
export function DuelResult({
  duel,
  rival,
  kick,
  outcome,
  myScore,
  rivalScore,
  turn,
  rows,
  sp,
  correct,
  home,
  h2h,
  weeklyRank,
  isPremium,
  onShare,
}: {
  duel: DuelSessionFull;
  rival: string;
  kick: string;
  outcome: Outcome;
  myScore: number;
  rivalScore: number;
  turn: string;
  rows: SubjectRow[];
  sp: number | null;
  correct: number;
  home: DuelHome | undefined;
  h2h: HeadToHead | null;
  weeklyRank: number | null;
  isPremium: boolean;
  onShare: () => void;
}) {
  const router = useRouter();
  const now = useNow(30_000);
  const rematch = useRematch();
  const [rematchCode, setRematchCode] = useState<string | null>(null);
  const rematchDuel = useDuelFull(rematchCode ?? "", Boolean(rematchCode));
  const rematchAccepted = (rematchDuel.data?.session.participants.length ?? 0) >= 2;
  const { data: plan } = useQuery({
    queryKey: ["settings", "subscription-status"],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60_000,
    enabled: !isPremium,
  });

  const stamp = outcome === "W" ? "WON" : outcome === "D" ? "DRAW" : null;
  const multi = rows.length > 1;
  const record = home?.record;

  let spNote: string;
  if (!duel.winnerTakesBonus) spNote = `${correct} correct × 1.5, the duel rate. You earn it win or lose.`;
  else if (outcome === "W") spNote = `${correct} correct at the winner's rate, 1.5×.`;
  else if (outcome === "D") spNote = `${correct} correct at 1.5×. A draw pays you both the winner's rate.`;
  else spNote = `${correct} correct at the normal rate. Winners get 1.5×.`;

  let streakTitle = "No win run yet";
  let streakNote = "Win your next duel to start one";
  const run = record?.currentWinRun ?? 0;
  const best = record?.bestWinRun ?? 0;
  const played = record ? record.won + record.lost + record.drawn : 0;
  if (outcome === "W") {
    if (played <= 1) {
      streakTitle = "First duel, first win";
      streakNote = "Win the next one to start a run";
    } else if (run >= 2) {
      streakTitle = `${run} wins in a row`;
      streakNote = `Your best run is ${best}`;
    } else {
      streakTitle = "A new win run";
      streakNote = "Win the next one to keep it going";
    }
  } else if (outcome === "D") {
    streakTitle = run > 0 ? `Win run paused at ${run}` : "No win run yet";
    streakNote = run > 0 ? "A draw doesn't end it" : "A draw doesn't start one";
  } else if (best > 0) {
    streakTitle = "Win run over for now";
    streakNote = `Your best run is ${best}`;
  }

  async function askRematch() {
    playDuelSound("go");
    try {
      const snapshot = await rematch.mutateAsync(duel.id);
      if (snapshot.session.participants.length >= 2) {
        router.push(`/dashboard/duel/${snapshot.session.code}` as Route);
        return;
      }
      setRematchCode(snapshot.session.code);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not send the rematch."));
    }
  }

  const free = home?.freeDuel;
  const freeCopy = FREE_COPY[outcome];

  return (
    <div>
      <header className={s.top}>
        <Link className={s.iconBtn} href={"/dashboard/duel" as Route} aria-label="Back to Duel">
          <BackIcon />
        </Link>
        <h1 className={s.topTitle}>Duel result</h1>
      </header>

      <div className={m.resultGrid}>
        <div>
          <section className={cn(m.verdict, stamp && m.verdictJolt)}>
            {stamp && <span className={cn(m.stamp, stamp === "WON" ? m.stampWon : m.stampDraw)} aria-hidden="true">{stamp}</span>}
            <p className={m.kick}>{kick}</p>
            <h2 className={m.head}>{headline(outcome, rival, myScore, rivalScore)}</h2>
            <div className={m.scoreline} aria-label={`You ${myScore}, ${rival} ${rivalScore}`}>
              <div className={cn(m.slSide, myScore < rivalScore && m.lose)}>
                <div className={m.ringY}><DuelAvatar self size={52} /></div>
                <b>{myScore}</b>
                <span>You</span>
              </div>
              <span className={m.slDash} aria-hidden="true">–</span>
              <div className={cn(m.slSide, rivalScore < myScore && m.lose)}>
                <div className={m.ringR}><DuelAvatar size={52} /></div>
                <b>{rivalScore}</b>
                <span>{rival}</span>
              </div>
            </div>
            <p className={m.turn}>{turn}</p>
          </section>

          <section className={m.block}>
            <h3 className={m.h}>{multi ? "Subject by subject" : "The paper"}</h3>
            <table className={m.tbl}>
              <thead>
                <tr><th scope="col">Subject</th><th scope="col">You</th><th scope="col">{rival}</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td className={row.mine > row.theirs ? m.won : undefined}>
                      {row.mine}
                      {row.mine > row.theirs && <span className={m.pip} style={{ background: "var(--ui-you)" }} aria-label="won" />}
                    </td>
                    <td className={row.theirs > row.mine ? m.won : undefined}>
                      {row.theirs}
                      {row.theirs > row.mine && <span className={m.pip} style={{ background: "var(--ui-rival)" }} aria-label="won" />}
                    </td>
                  </tr>
                ))}
                {multi && (
                  <tr className={m.total}><td>Total</td><td>{myScore}</td><td>{rivalScore}</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        <div>
          <section className={m.block}>
            <h3 className={m.h}>What this duel did</h3>
            <ul className={m.got}>
              <li>
                <span><b>Study Points</b><small>{spNote}</small></span>
                <span className={cn(m.val, m.sp)}>{sp === null ? "…" : `+${sp} SP`}</span>
              </li>
              <li>
                <span><b>{streakTitle}</b><small>{streakNote}</small></span>
                <span className={m.val}>{outcome === "L" ? 0 : run}</span>
              </li>
              <li>
                <span>
                  <b>{h2hTitle(rival, h2h)}</b>
                  <small>{h2h && h2h.form.length > 1 ? `Your last ${h2h.form.length} duels with ${rival}` : `Your duels with ${rival} so far`}</small>
                </span>
                {h2h && h2h.form.length > 0 && <FormGuide form={h2h.form} />}
              </li>
              <li>
                <span><b>Leaderboard this week</b><small>{weeklyRank ? "Your place on the board now" : "Duel SP counts for this week's board"}</small></span>
                <Link className={cn(m.val, m.valLink)} href={"/dashboard/leaderboard" as Route}>
                  {weeklyRank ? `#${weeklyRank}` : "See it"}
                  <ChevronRight />
                </Link>
              </li>
            </ul>
          </section>

          <div className={m.actions}>
            {!isPremium && free ? (
              <div className={m.freebox}>
                <b>{freeCopy.head(rival)}</b>
                <p>{freeCopy.text(rival)}</p>
                <span className={m.when}>Next free duel in {formatLeft(new Date(free.nextFreeDuelAt).getTime() - now)}</span>
                <Link className={cn(s.btn, s.ink, s.wide)} href={"/dashboard/settings?tab=subscription" as Route}>
                  {freeCopy.button}
                </Link>
                {plan && (
                  <small>₦{plan.priceNaira.toLocaleString("en-NG")} for {plan.durationMonths} month{plan.durationMonths === 1 ? "" : "s"} · unlimited duels</small>
                )}
              </div>
            ) : rematchCode ? (
              rematchAccepted ? (
                <>
                  <div className={m.rematch}>
                    <DuelAvatar size={40} />
                    <div><b>{rival} said yes</b><span>Same subjects, same time</span></div>
                  </div>
                  <Link className={cn(s.btn, s.ink, s.wide)} href={`/dashboard/duel/${rematchCode}` as Route}>
                    Go to the rematch
                  </Link>
                </>
              ) : (
                <div className={m.rematch} aria-live="polite">
                  <DuelAvatar size={40} />
                  <div><b>Rematch sent</b><span>Waiting for {rival} to say yes</span></div>
                  <div className={m.dots} aria-hidden="true" style={{ flex: "none" }}><i /><i /><i /></div>
                </div>
              )
            ) : (
              <>
                <p className={m.nudge}>{NUDGE[outcome](rival, h2h)}</p>
                <button type="button" className={cn(s.btn, s.ink, s.wide)} disabled={rematch.isPending} onClick={askRematch}>
                  Rematch {rival}
                </button>
              </>
            )}
            <div className={m.row}>
              <Link className={cn(s.btn, s.line)} href={`/dashboard/duel/${duel.code}/review` as Route}>
                Review answers
              </Link>
              <button type="button" className={cn(s.btn, s.line)} onClick={onShare}>
                Share result
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
