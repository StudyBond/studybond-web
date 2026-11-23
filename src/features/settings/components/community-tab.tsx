"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { WhatsAppGlyph } from "@/features/home/channel-sheet";
import { hasJoinedChannel, setJoinedChannel, useCommunity } from "@/features/home/community";
import { boardLabel } from "@/features/home/format";
import { cn } from "@/lib/utils/cn";

import { Loading } from "./settings-ui";
import s from "./settings.module.css";

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/**
 * Community: the board's WhatsApp channel (everyone) and premium group.
 * Admins set both links per board; the group link only reaches premium
 * students on that board.
 */
export function CommunityTab() {
  const community = useCommunity();
  const [joinedOverride, setJoinedOverride] = useState<boolean | null>(null);

  if (!community.data) {
    return <Loading text={community.isError ? "We couldn't load the links. Check your internet and try again." : undefined} />;
  }

  const c = community.data;
  const label = boardLabel({ code: c.boardCode, examName: c.examName });
  const joined = joinedOverride ?? hasJoinedChannel(c.boardCode);

  function markJoined(next: boolean) {
    setJoinedChannel(c.boardCode, next);
    setJoinedOverride(next);
  }

  return (
    <>
      <p className={s.lead}>The links for {label}. Change board and you get that board&rsquo;s links.</p>

      <h2 className={cn(s.gh, s.ghFirst)}>Channel</h2>
      <section className={s.card}>
        <div className={s.wa}>
          <span className={s.waTile}><WhatsAppGlyph /></span>
          <span className={s.itemT}>
            <b>{label} on WhatsApp</b>
            <small>
              {c.channelUrl
                ? "StudyBond posts tips, paper reminders and news there. It's a channel, so only StudyBond posts, and your number stays private."
                : `${label} has no channel yet. It will show here when it opens.`}
            </small>
          </span>
        </div>
        {c.channelUrl ? (
          <div className={s.btnRow}>
            <a
              href={c.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(s.btn, s.btnSm)}
              onClick={() => markJoined(true)}
            >
              {joined ? "Open the channel" : "Join the channel"}
            </a>
            <button type="button" className={s.check} aria-pressed={joined} onClick={() => markJoined(!joined)}>
              <span className={cn(s.box, joined && s.boxOn)}>{joined ? <Check /> : null}</span>
              I&rsquo;ve joined
            </button>
          </div>
        ) : null}
      </section>

      <h2 className={s.gh}>Premium group</h2>
      <section className={s.card}>
        <div className={s.wa}>
          <span className={cn(s.waTile, !(c.isPremium && c.groupUrl) && s.waTileDim)}><GroupIcon /></span>
          <span className={s.itemT}>
            <b>{label} premium group</b>
            <small>
              {!c.hasGroup
                ? `${label} has no premium group yet.`
                : c.isPremium
                  ? "A private WhatsApp group for premium students on this board. Ask questions and share tips."
                  : "A private WhatsApp group for premium students on this board. The link shows here when you go premium."}
            </small>
          </span>
        </div>
        {c.isPremium && c.groupUrl ? (
          <div className={s.btnRow}>
            <a href={c.groupUrl} target="_blank" rel="noopener noreferrer" className={cn(s.btn, s.btnSm)}>
              Join the group
            </a>
          </div>
        ) : !c.isPremium && c.hasGroup ? (
          <div className={s.btnRow}>
            <Link href={"/dashboard/settings?tab=subscription" as Route} className={cn(s.btn, s.btnLine, s.btnSm)}>
              See premium
            </Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
