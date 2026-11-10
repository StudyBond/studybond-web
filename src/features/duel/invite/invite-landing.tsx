"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { DuelInvite } from "@/lib/api/duel";
import { cn } from "@/lib/utils/cn";

import { GiftIcon, PaperIcon } from "../ui/icons";
import { DuelAvatar, formatLeft, printedCode, useNow } from "../ui/parts";
import v from "./invite.module.css";

const SOURCE: Record<string, string> = {
  REAL_PAST_QUESTION: "Real past questions",
  PRACTICE: "Practice questions",
  MIXED: "Mixed questions",
};

function boardLabel(invite: DuelInvite) {
  const { name, trackName } = invite.board;
  return trackName && !name.includes(trackName) ? `${name} ${trackName}` : name;
}

/**
 * The invite landing (mockup 13a): a visitor with no account opens a duel
 * slip link. A taster says "Your first duel is free"; a full paper says
 * free accounts play tasters, and offers to ask the host for one.
 */
export function InviteLanding({ code, invite }: { code: string; invite: DuelInvite | null }) {
  const now = useNow();
  const duelPath = `/dashboard/duel/${code}`;
  const board = invite ? boardLabel(invite) : "";
  const boardParam = invite?.board.code ? `&board=${encodeURIComponent(invite.board.code)}` : "";
  const signup = (next: string) => `/signup?next=${encodeURIComponent(next)}${boardParam}` as Route;
  const login = `/login?next=${encodeURIComponent(duelPath)}` as Route;

  const left = invite?.expiresAt ? new Date(invite.expiresAt).getTime() - now : null;
  const closed = !invite || invite.status !== "OPEN" || (left !== null && left <= 0);
  const host = invite?.host.firstName ?? "A friend";

  return (
    <div className={cn("sb-ui", v.page)}>
      <header className={v.bar}>
        <Link href={"/" as Route} aria-label="StudyBond home">
          <Image src="/studybond-lockup.png" alt="StudyBond" width={128} height={32} priority />
        </Link>
        <Link className={v.login} href={login}>Log in</Link>
      </header>

      <main className={v.scroll}>
        {!invite ? (
          <section className={v.hero}>
            <h1>We couldn&apos;t find that duel</h1>
            <p>Check the code on the slip, or ask your friend to send the link again.</p>
          </section>
        ) : (
          <>
            <section className={v.hero}>
              <h1>{host} challenged you to a duel</h1>
              <p>
                {invite.isTaster
                  ? `You both get the same ${invite.totalQuestions} questions and the same clock, and you watch each other live. Whoever gets more right wins.`
                  : "Same questions, same clock, and you watch each other's progress live. Whoever gets more marks wins."}
              </p>
            </section>

            <div className={v.slip} aria-label={`${host}'s duel slip`}>
              <div className={v.hd}>
                <b>Study<span>Bond</span></b>
                <span>{invite.isTaster ? "Taster duel" : "Duel slip"}</span>
              </div>
              <div className={v.from}>
                <DuelAvatar size={44} />
                <div>
                  <b>{invite.host.shortName}</b>
                  <small>
                    {[invite.host.course, invite.host.weeklyRank ? `#${invite.host.weeklyRank} this week` : null].filter(Boolean).join(" · ") || board}
                  </small>
                </div>
              </div>
              <dl>
                <dt>Paper</dt>
                <dd>{board} · {invite.isTaster ? "Taster questions" : SOURCE[invite.questionSource] ?? "Real past questions"}</dd>
                <dt>Subjects</dt>
                <dd>{invite.subjects.join(", ")}</dd>
                <dt>Length</dt>
                <dd>
                  {invite.totalQuestions} questions
                  {invite.durationSeconds ? ` · ${Math.round(invite.durationSeconds / 60)} min` : ""}
                </dd>
              </dl>
              <div className={v.tear} />
              <div className={v.code}>
                <b>{printedCode(invite.code)}</b>
                {/* A ticking clock: the server and the browser are a second apart. */}
                <span className="ui-num" suppressHydrationWarning>
                  {closed ? closedLine(invite.status, left) : left !== null ? `Expires in ${formatLeft(left)}` : ""}
                </span>
              </div>
            </div>

            {closed ? (
              <>
                <div className={cn(v.freeline, v.full)}>
                  <PaperIcon />
                  <span>
                    <b>{closedTitle(invite.status, left)}</b>
                    Ask {host} for a new slip. You can make a free account now and be ready for it.
                  </span>
                </div>
                <Link className={v.btn} href={signup("/dashboard/duel")}>Create a free account</Link>
                <Link className={v.ghostbtn} href={login}>I already have an account</Link>
              </>
            ) : invite.isTaster ? (
              <>
                <div className={v.freeline}>
                  <GiftIcon />
                  <span>
                    <b>Your first duel is free</b>
                    Make a free account in under a minute and this one is on us. No card needed.
                  </span>
                </div>
                <Link className={v.btn} href={signup(duelPath)}>Create a free account and accept</Link>
                <Link className={v.ghostbtn} href={login}>I already have an account</Link>
              </>
            ) : (
              <>
                <div className={cn(v.freeline, v.full)}>
                  <PaperIcon />
                  <span>
                    <b>This one is a full paper</b>
                    Free accounts play taster duels: one subject, 15 questions. Ask {host} for a taster, or go premium to take the full paper.
                  </span>
                </div>
                <Link className={v.btn} href={signup(`${duelPath}?ask=taster`)}>Make a free account and ask for a taster</Link>
                <Link className={v.ghostbtn} href={login}>I already have an account</Link>
                <p className={v.sent}>After you sign up, {host} sees: &ldquo;Your friend wants a taster. Send one?&rdquo;</p>
              </>
            )}

            <section className={v.how}>
              <h2>How a duel works</h2>
              <ol>
                <li>
                  <span className={v.n}>1</span>
                  <span>
                    <b>You both get the same paper</b>
                    {invite.isTaster || invite.questionSource === "REAL_PAST_QUESTION"
                      ? `Real ${board} past questions, timed like the real exam.`
                      : `${board} questions, timed like the real exam.`}
                  </span>
                </li>
                <li>
                  <span className={v.n}>2</span>
                  <span>
                    <b>You race live</b>
                    See which question {host} is on while you write, and send a quick reaction.
                  </span>
                </li>
                <li>
                  <span className={v.n}>3</span>
                  <span>
                    <b>Marked subject by subject</b>
                    Watch the lead swing, then review every answer with explanations.
                  </span>
                </li>
              </ol>
            </section>
            <p className={v.small}>Invited by {invite.host.shortName} · studybond.app</p>
          </>
        )}
      </main>
    </div>
  );
}

function closedTitle(status: DuelInvite["status"], left: number | null) {
  if (status === "FULL" || status === "STARTED") return "Someone took this seat already";
  if (status === "FINISHED") return "This duel has been played";
  if (status === "CANCELLED") return "This duel was called off";
  if (status === "EXPIRED" || (left !== null && left <= 0)) return "This slip has expired";
  return "This slip is closed";
}

function closedLine(status: DuelInvite["status"], left: number | null) {
  if (status === "EXPIRED" || (left !== null && left <= 0)) return "Expired";
  if (status === "FINISHED") return "Played";
  if (status === "CANCELLED") return "Called off";
  return "Full";
}
