"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { useAnswerChallenge } from "@/features/duel/hooks/use-duel-play";
import type { DuelHome, DuelSessionFull } from "@/lib/api/duel";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { firstName, formatLeft, useNow } from "../ui/parts";

/**
 * A free student opens a taster after this week's free duel is gone. The
 * copy follows how their last free duel went. "Later" only claims to tell the
 * other player when it really does: a direct challenge gets a "Not now".
 */
export function PassUsedSheet({
  duel,
  freeDuel,
  onClose,
}: {
  duel: DuelSessionFull;
  freeDuel: DuelHome["freeDuel"];
  onClose: () => void;
}) {
  const now = useNow();
  const { decline } = useAnswerChallenge();
  const [asked, setAsked] = useState(false);
  const host = duel.participants.find((participant) => participant.userId === duel.hostUserId);
  const name = firstName(host?.fullName);
  const last = freeDuel.lastFreeDuel;
  const sameRival = last && firstName(last.opponentName) === name;
  const isChallenge = duel.kind === "CHALLENGE";

  let head = "This week's free duel is used";
  let body = `Your free duel for this week is gone. Play ${name} now with premium, or wait till Sunday.`;
  let cta = "Play now with premium";
  let later = "I'll play on Sunday";
  let sent = `Sent. ${name} knows you're coming on Sunday.`;

  if (sameRival && last.result === "L") {
    head = `${name} won't let you hear word`;
    body = `${name} beat you last time, and this week's free duel is used. Get your revenge now, or let ${name} enjoy the win till Sunday.`;
    cta = "Get my revenge now";
    later = `I'll deal with ${name} on Sunday`;
  } else if (sameRival && last.result === "W") {
    head = `${name} wants those marks back`;
    body = `You won the last one, and ${name} is not taking it lightly. Your free duel is used, so defend your win now, or make ${name} wait till Sunday.`;
    cta = "Defend my win now";
    later = `Make ${name} wait till Sunday`;
    sent = `Sent. ${name} has to wait till Sunday.`;
  } else if (sameRival && last.result === "D") {
    head = "Unfinished business";
    body = "Your last duel ended level, and this week's free duel is used. Settle it now, or settle it on Sunday.";
    cta = "Settle it now";
    later = "Settle it on Sunday";
    sent = "Sent. Sunday it is.";
  }

  return (
    <div className={cn("sb-ui", s.scrim)} onClick={onClose}>
      <div className={s.sheet} role="dialog" aria-label="Free duel already used" onClick={(event) => event.stopPropagation()}>
        <div className={s.grab} aria-hidden="true" />
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>{head}</h2>
        <p className={s.sheetText}>{body}</p>
        <div className={s.clock}>
          <div>
            <small>Next free duel unlocks Sunday</small>
            <b>{formatLeft(new Date(freeDuel.nextFreeDuelAt).getTime() - now)}</b>
          </div>
        </div>
        <Link className={cn(s.btn, s.ink, s.wide)} href={"/dashboard/settings?tab=subscription" as Route}>
          {cta}
        </Link>
        <p className={s.priceNote}>With premium · unlimited duels on this exam</p>
        {asked ? (
          <p className={s.sentNote}>{sent}</p>
        ) : (
          <button
            type="button"
            className={cn(s.btn, s.line, s.wide)}
            disabled={decline.isPending}
            onClick={async () => {
              if (isChallenge) {
                await decline.mutateAsync(duel.id).catch(() => undefined);
                setAsked(true);
              } else {
                onClose();
              }
            }}
          >
            {later}
          </button>
        )}
      </div>
    </div>
  );
}
