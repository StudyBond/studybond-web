"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";

import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { DuelHome, DuelResultLetter } from "@/lib/api/duel";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { DuelAvatar, SubjectTile, formatLeft, useNow } from "../ui/parts";
import r from "./rematch.module.css";

export type RematchSheetMode = { kind: "pick"; subjects: string[] } | { kind: "used" };

function endedOn(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" }).format(new Date(iso));
}

/**
 * Rematch on the free plan (mockup M1). Free duels are one-subject tasters,
 * so a free student's rematch of a full paper offers a taster on one of its
 * subjects, with a gentle premium note (it says when their premium ended if
 * they had it). With this week's free duel used, it's the premium nudge only.
 */
export function RematchSheet({
  rivalShort,
  rivalFirst,
  lastLine,
  h2hLine,
  lastResult,
  mode,
  freeDuel,
  sending,
  onSend,
  onClose,
}: {
  rivalShort: string;
  rivalFirst: string;
  lastLine: string;
  h2hLine: string;
  lastResult: DuelResultLetter | null;
  mode: RematchSheetMode;
  freeDuel: DuelHome["freeDuel"];
  sending: boolean;
  onSend: (subject: string) => void;
  onClose: () => void;
}) {
  const now = useNow();
  const { data: examProfile } = useExamProfile();
  const { data: plan } = useQuery({
    queryKey: ["settings", "subscription-status"],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60_000,
  });
  const subjects = mode.kind === "pick" ? mode.subjects : [];
  const [picked, setPicked] = useState<string | null>(subjects[0] ?? null);

  const had = Boolean(freeDuel.premiumEndedAt);
  const price = plan ? `₦${plan.priceNaira.toLocaleString("en-NG")} for ${plan.durationMonths} month${plan.durationMonths === 1 ? "" : "s"}` : null;
  const premiumHref = "/dashboard/settings?tab=subscription" as Route;
  const metaFor = (name: string) => examProfile?.subjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());

  let usedBody = `This week's free duel is used. Rematch ${rivalFirst} with premium now, or wait till Sunday.`;
  let usedCta = "Rematch with premium";
  let usedLater = "Wait till Sunday";
  if (lastResult === "W") {
    usedBody = `You won the last one, and ${rivalFirst} is not taking it lightly. This week's free duel is used, so defend your win with premium now, or make ${rivalFirst} wait till Sunday.`;
    usedCta = "Defend my win with premium";
    usedLater = `Make ${rivalFirst} wait till Sunday`;
  } else if (lastResult === "L") {
    usedBody = `${rivalFirst} beat you last time, and this week's free duel is used. Get your revenge with premium now, or let ${rivalFirst} enjoy the win till Sunday.`;
    usedCta = "Get my revenge with premium";
    usedLater = `I'll deal with ${rivalFirst} on Sunday`;
  } else if (lastResult === "D") {
    usedBody = "Your last duel ended level, and this week's free duel is used. Settle it with premium now, or settle it on Sunday.";
    usedCta = "Settle it with premium";
    usedLater = "Settle it on Sunday";
  }

  // "a English" reads wrong.
  const article = picked && /^[aeiou]/i.test(picked) ? "an" : "a";

  // Only ever opened by a tap, so this runs in the browser.
  if (typeof document === "undefined") return null;
  // Into <body>: the shell's transformed wrapper traps position:fixed, which left
  // the bottom bar undimmed below the sheet.
  return createPortal(
    <div className={cn("sb-ui", s.scrim)} onClick={onClose}>
      <div className={s.sheet} role="dialog" aria-label={`Rematch ${rivalShort}`} onClick={(event) => event.stopPropagation()}>
        <div className={s.grab} aria-hidden="true" />
        <div className={r.head}>
          <DuelAvatar size={44} />
          <div>
            <h2>Rematch {rivalShort}</h2>
            <p>{[lastLine, h2hLine].filter(Boolean).map((line) => `${line}.`).join(" ")}</p>
          </div>
        </div>

        {mode.kind === "pick" ? (
          <>
            <div className={r.note}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>
                {had
                  ? `Your premium ended on ${endedOn(freeDuel.premiumEndedAt!)}, so a rematch on the full paper needs it again.`
                  : `A rematch on the full paper (${subjects.length} subjects) comes with premium.`}{" "}
                {price ? <b>{price}.</b> : null}
                <br />
                <Link className={r.noteLink} href={premiumHref}>{had ? "Renew premium" : "See premium"}</Link>
              </span>
            </div>

            <p className={r.label}>Or play a free taster: pick one subject</p>
            <div className={r.subs} role="radiogroup" aria-label="Taster subject">
              {subjects.map((name) => {
                const meta = metaFor(name);
                const on = picked === name;
                return (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={cn(r.sub, on && r.on)}
                    onClick={() => setPicked(name)}
                  >
                    <SubjectTile iconName={meta?.iconName} code={meta?.code ?? name.slice(0, 3)} colorToken={meta?.colorToken} size={34} />
                    <span className={r.subName}>{name}</span>
                    <em>15 questions</em>
                    <span className={r.dot} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            <p className={r.fine}>Uses this week&apos;s free duel. {rivalFirst} gets 30 minutes to say yes.</p>
            <button
              type="button"
              className={cn(s.btn, s.ink, s.wide)}
              disabled={!picked || sending}
              onClick={() => picked && onSend(picked)}
            >
              {sending ? "Sending" : `Send ${article} ${picked ?? ""} taster rematch`}
            </button>
            <button type="button" className={cn(s.btn, s.line, s.wide)} onClick={onClose}>
              Not now
            </button>
          </>
        ) : (
          <>
            <p className={s.sheetText}>{usedBody}</p>
            <div className={s.clock}>
              <div>
                <small>Next free duel unlocks Sunday</small>
                <b>{formatLeft(new Date(freeDuel.nextFreeDuelAt).getTime() - now)}</b>
              </div>
            </div>
            <Link className={cn(s.btn, s.ink, s.wide)} href={premiumHref}>
              {usedCta}
            </Link>
            <p className={s.priceNote}>
              {[had ? `Your premium ended on ${endedOn(freeDuel.premiumEndedAt!)}` : null, price, had ? null : "unlimited duels"].filter(Boolean).join(" · ")}
            </p>
            <button type="button" className={cn(s.btn, s.line, s.wide)} onClick={onClose}>
              {usedLater}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
