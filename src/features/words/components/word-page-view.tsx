import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { KIND_OF_THE_DAY, longDay, shortDay } from "../lib/words";
import type { WordPage } from "../types";
import s from "../words.module.css";
import { ArrowIcon } from "./bits";
import { WordEntry } from "./word-entry";

/**
 * studybond.app/word-of-the-day/<slug>: one past card, the same entry layout
 * as the day's page, with links to the days either side. Future cards never
 * get a page (the backend says 404 until a card has had its day).
 */
export function WordPageView({ page, signedIn }: { page: WordPage; signedIn: boolean }) {
  const card = page.card;
  const here = `/word-of-the-day/${card.slug}`;
  const lastShown = page.shownOn[0] ?? null;
  return (
    <div className={cn("sb-ui", s.page)}>
      <main className={s.wrap}>
        <div className={s.hd}>
          {lastShown ? (
            <p className={s.date}>
              {KIND_OF_THE_DAY[card.kind]} on {longDay(lastShown)}
              {page.shownOn.length > 1 ? `, and ${page.shownOn.length - 1} other ${page.shownOn.length === 2 ? "day" : "days"}` : ""}
            </p>
          ) : null}
          <div className={s.dayNav}>
            <Link className={s.ghost} href={"/word-of-the-day" as Route} style={{ paddingLeft: 0 }}>
              <ArrowIcon className={s.arrow} back />
              Today&apos;s words
            </Link>
            {page.previousDate ? (
              <Link className={s.ghost} href={`/word-of-the-day?before=${nextDayAfter(page.previousDate)}` as Route}>
                {shortDay(page.previousDate)} and before
              </Link>
            ) : null}
          </div>
        </div>
        <div className={s.pair} style={{ maxWidth: 720 }}>
          <WordEntry card={card} signedIn={signedIn} here={here} />
        </div>
      </main>
    </div>
  );
}

/* The archive lists days strictly before ?before=, so start one day after. */
function nextDayAfter(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}
