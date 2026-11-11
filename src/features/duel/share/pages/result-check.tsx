import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { ShareSlipArt, type CardFonts } from "../card/share-card";
import { SHARE_HOST, type ShareCardView } from "../types";
import p from "./pages.module.css";

const PAGE_FONTS: CardFonts = { head: "var(--ui-head)", body: "var(--ui-body)" };

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function longDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(iso));
}

/**
 * studybond.app/r/<number> (mockup R1/R2): proves a shared result is real.
 * Shows only the card, with the sharer's switches, and a way to take them on.
 */
export function ResultCheck({ card }: { card: ShareCardView | null }) {
  return (
    <div className={cn("sb-ui", p.page)}>
      <header className={p.bar}>
        <Link href={"/" as Route} aria-label="StudyBond home">
          <Image src="/studybond-lockup.png" alt="StudyBond" width={128} height={63} priority className={p.lockup} />
        </Link>
        <nav className={p.nav}>
          <Link className={p.login} href={"/login" as Route}>Log in</Link>
          <Link className={cn(p.ghostSm, p.wideOnly)} href={"/signup" as Route}>Create a free account</Link>
        </nav>
      </header>

      {!card ? (
        <main className={p.none}>
          <h1>We couldn&apos;t find that result</h1>
          <p>Check the number on the card. It looks like R7K-2QD, and it&apos;s printed at the bottom of the slip.</p>
          <Link className={p.btn} href={"/" as Route}>See how StudyBond works</Link>
        </main>
      ) : (
        <main className={p.split}>
          <div className={p.slipCol}>
            <div className={p.slipWrap}>
              <ShareSlipArt card={card} square={false} u={1} fonts={PAGE_FONTS} />
            </div>
          </div>
          <div className={p.textCol}>
            <div className={p.check}>
              <ShieldIcon />
              <span>
                <b>Checked by StudyBond</b>
                These marks come from our own records, not from a picture. {card.kind === "DUEL" ? "Played" : "Written"} on {longDate(card.playedAt)}.
              </span>
            </div>
            <section className={p.cta}>
              <h1>{card.kind === "EXAM" ? "Practise with real past questions" : card.cta}</h1>
              <p>
                {card.kind === "EXAM"
                  ? `Same timed papers ${card.me.firstName} writes, marked as you finish. Or challenge ${card.me.firstName} to a duel.`
                  : `Duel ${card.me.firstName} on the same real past questions, live. Your first duel is free.`}
              </p>
              <div className={p.btns}>
                {card.challengeName ? (
                  <Link className={p.btn} href={`/c/${card.challengeName}` as Route}>Challenge {card.me.firstName}</Link>
                ) : (
                  <Link className={p.btn} href={"/signup" as Route}>Create a free account</Link>
                )}
                <Link className={p.ghost} href={"/" as Route}>How StudyBond works</Link>
              </div>
            </section>
            <p className={p.small}>
              Result <b>{card.printedNumber}</b> · {SHARE_HOST}/r/{card.number}
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
