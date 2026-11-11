import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { GiftIcon } from "../../ui/icons";
import { AvatarArt } from "../card/avatar-art";
import { SHARE_HOST, type ChallengeLinkView } from "../types";
import p from "./pages.module.css";

/**
 * studybond.app/c/<name> for visitors with no account (mockup C1).
 * Signed-in students never see it: /c/<name>/go opens Challenge a friend.
 * The sign-up link carries via=<name> so an invite can be credited later,
 * once the referral plan is confirmed. Nothing reads it yet.
 */
export function ChallengeLanding({ link, board }: { link: ChallengeLinkView | null; board: string }) {
  const here = link ? `/c/${link.name}` : "/";
  const boardParam = link?.board?.code ? `&board=${encodeURIComponent(link.board.code)}` : "";
  const signup = link ? (`/signup?next=${encodeURIComponent(here)}${boardParam}&via=${encodeURIComponent(link.name)}` as Route) : ("/signup" as Route);
  const login = `/login?next=${encodeURIComponent(here)}` as Route;
  const who = link?.firstName ?? "";

  return (
    <div className={cn("sb-ui", p.page, p.narrow)}>
      <header className={p.bar}>
        <Link href={"/" as Route} aria-label="StudyBond home">
          <Image src="/studybond-lockup.png" alt="StudyBond" width={128} height={63} priority className={p.lockup} />
        </Link>
        <Link className={p.login} href={login}>Log in</Link>
      </header>

      {!link ? (
        <main className={p.none}>
          <h1>We couldn&apos;t find that link</h1>
          <p>Check the spelling, or ask your friend to send it again.</p>
          <Link className={p.btn} href={"/" as Route}>See how StudyBond works</Link>
        </main>
      ) : (
        <main className={p.scroll}>
          <section className={p.hero}>
            <h1>{who} wants a duel</h1>
            <p>You both get the same questions and the same clock, and you watch each other live. Whoever gets more marks wins.</p>
          </section>

          <div className={p.slip} aria-label={`${who}'s challenge`}>
            <div className={p.hd}>
              <b>Study<span>Bond</span></b>
              <span>Open challenge</span>
            </div>
            <div className={p.from}>
              <AvatarArt look={link.avatar} size={44} ringOn="#f5c890" />
              <div>
                <b>{link.shortName}</b>
                <small>{[link.course, link.weeklyRank ? `#${link.weeklyRank} this week` : null].filter(Boolean).join(" · ") || board}</small>
              </div>
            </div>
            <dl>
              <dt>Board</dt>
              <dd>{board}</dd>
              <dt>Paper</dt>
              <dd>You pick the subjects after you sign up</dd>
            </dl>
            <div className={p.tear} />
            <div className={p.linkLine}>
              <b>{SHARE_HOST}/c/{link.name}</b>
              <span>Always open</span>
            </div>
          </div>

          <div className={p.free}>
            <GiftIcon />
            <span>
              <b>Your first duel is free</b>
              Make a free account in under a minute. Free accounts play taster duels: one subject, 15 questions. No card needed.
            </span>
          </div>
          <Link className={p.btn} href={signup}>Create a free account and challenge {who}</Link>
          <Link className={p.ghost} href={login}>I already have an account</Link>

          <section className={p.how}>
            <h2>How a duel works</h2>
            <ol>
              <li>
                <span className={p.n}>1</span>
                <span><b>You both get the same paper</b>Real {board} past questions, timed like the real exam.</span>
              </li>
              <li>
                <span className={p.n}>2</span>
                <span><b>You race live</b>See which question {who} is on while you write, and send a quick reaction.</span>
              </li>
              <li>
                <span className={p.n}>3</span>
                <span><b>Marked subject by subject</b>Watch the lead swing, then review every answer with explanations.</span>
              </li>
            </ol>
          </section>
          <p className={p.small}>{link.shortName}&apos;s challenge link · {SHARE_HOST}</p>
        </main>
      )}
    </div>
  );
}
