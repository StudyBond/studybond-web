import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { GiftIcon } from "../../ui/icons";
import { AvatarArt } from "../card/avatar-art";
import { dailyPath, SHARE_HOST, type DailyLinkView } from "../types";
import p from "./pages.module.css";

/** The Daily Challenge clock, for a link whose student has shared no daily yet. */
const DEFAULT_MINUTES = 3;

/**
 * studybond.app/daily/<name>, printed on Daily Challenge cards, for visitors
 * with no account (mockup "Where the link goes"). It shows the student's
 * latest SHARED daily, with their switches, then sends the visitor to
 * today's challenge. Signed-in students never see it: /daily/<name>/go opens
 * today's challenge, or the side-by-side once they have taken it.
 */
export function DailyLanding({ daily, board }: { daily: DailyLinkView | null; board: string }) {
  const link = daily?.link ?? null;
  const card = daily?.card ?? null;
  const here = link ? dailyPath(link.name) : "/";
  const boardParam = link?.board?.code ? `&board=${encodeURIComponent(link.board.code)}` : "";
  const signup = (link ? `/signup?next=${encodeURIComponent(here)}${boardParam}&via=${encodeURIComponent(link.name)}` : "/signup") as Route;
  const login = `/login?next=${encodeURIComponent(here)}` as Route;

  const bar = (
    <header className={p.bar}>
      <Link href={"/" as Route} aria-label="StudyBond home">
        <Image src="/studybond-lockup.png" alt="StudyBond" width={128} height={63} priority className={p.lockup} />
      </Link>
      <Link className={p.login} href={login}>Log in</Link>
    </header>
  );

  if (!link) {
    return (
      <div className={cn("sb-ui", p.page, p.narrow)}>
        {bar}
        <main className={p.none}>
          <h1>We couldn&apos;t find that link</h1>
          <p>Check the spelling, or ask your friend to send it again.</p>
          <Link className={p.btn} href={"/" as Route}>See how StudyBond works</Link>
        </main>
      </div>
    );
  }

  const who = link.firstName;
  const day = card?.daily ?? null;
  // A link opened after midnight shows that day's result, marked closed.
  const today = day ? day.isToday : true;
  const dayWord = today ? "today’s" : `${day!.weekday}’s`;
  const minutes = day?.minutes ?? DEFAULT_MINUTES;
  const score = card?.showScore && card.exam ? card.exam.score : null;
  const total = card?.exam?.total ?? null;

  const title = !card
    ? `Take today’s Daily Challenge`
    : score !== null && total !== null
      ? `${who} got ${score} out of ${total} on ${dayWord} challenge`
      : `${who} took ${dayWord} challenge`;
  const lede = today
    ? `The Daily Challenge is one question from each of your ${total ?? ""} subjects, in ${minutes} minutes. Every ${board} student gets the same question in each subject today.`.replace("  ", " ")
    : `${day!.weekday}’s questions have closed. Today’s challenge is open, with new questions and the same rules: one question per subject, ${minutes} minutes, free.`;

  return (
    <div className={cn("sb-ui", p.page, p.narrow)}>
      {bar}
      <main className={p.scroll}>
        <section className={p.hero}>
          <h1>{title}</h1>
          <p>{lede}</p>
        </section>

        <div className={p.slip} aria-label={`${who}'s Daily Challenge`}>
          <div className={p.hd}>
            <b>Study<span>Bond</span></b>
            <span>{day ? `Daily Challenge · ${day.dateLine}` : "Daily Challenge"}</span>
          </div>
          <div className={p.from}>
            <AvatarArt look={(card?.me ?? link).avatar} size={44} ringOn="#f5c890" />
            <div>
              <b>{link.shortName}</b>
              <small>{link.course || board}</small>
            </div>
          </div>
          <dl>
            {score !== null && total !== null ? (
              <>
                <dt>Score</dt>
                <dd>{score} out of {total}</dd>
              </>
            ) : null}
            {day?.timeTaken ? (
              <>
                <dt>Time</dt>
                <dd>{day.timeTaken} of {minutes}:00</dd>
              </>
            ) : null}
            <dt>Board</dt>
            <dd>{board}</dd>
          </dl>
          <div className={p.tear} />
          <div className={p.linkLine}>
            <b>{today ? "Today’s questions" : `${day!.weekday}’s questions`}</b>
            <span>{today ? "Open until midnight" : "Closed"}</span>
          </div>
        </div>

        <div className={p.free}>
          <GiftIcon />
          <span>
            <b>Free for everyone</b>
            {today
              ? "Make a free account in under a minute. The Daily Challenge never needs premium. No card needed."
              : "Make a free account in under a minute. No card needed."}
          </span>
        </div>
        <Link className={p.btn} href={signup}>{today ? "Create a free account and take it" : "Create a free account and take today’s"}</Link>
        <Link className={p.ghost} href={login}>I already have an account</Link>

        {today ? (
          <section className={p.how}>
            <h2>How the Daily Challenge works</h2>
            <ol>
              <li>
                <span className={p.n}>1</span>
                <span><b>One question from each of your subjects</b>Real {board} past questions, picked fresh each day.</span>
              </li>
              <li>
                <span className={p.n}>2</span>
                <span><b>{minutes} minutes, one try</b>Your mark is checked by StudyBond, so it counts.</span>
              </li>
              <li>
                <span className={p.n}>3</span>
                <span><b>New questions at midnight</b>Each one earns up to 40 SP for the leaderboard: some for taking it, more for each right answer.</span>
              </li>
            </ol>
          </section>
        ) : null}
        <p className={p.small}>{link.shortName}&apos;s Daily Challenge link · {SHARE_HOST}</p>
      </main>
    </div>
  );
}
