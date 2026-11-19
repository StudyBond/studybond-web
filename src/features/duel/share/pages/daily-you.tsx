"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { AvatarArt } from "../card/avatar-art";
import { challengePath, DAILY_START_PATH, resultPath, type DailyLinkView, type DailyViewer } from "../types";
import p from "./pages.module.css";

const marksWord = (n: number) => `${n} mark${n === 1 ? "" : "s"}`;

/** "Thu 19 Nov", today in Lagos. */
function todayLine() {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "Africa/Lagos" }).format(new Date());
  return `${part({ weekday: "short" })} ${part({ day: "numeric", month: "short" })}`;
}

/**
 * studybond.app/daily/<name>/you: a signed-in student who has already taken
 * today's Daily Challenge sees both results side by side (mockup "Signed in,
 * already took today's"). A daily can't be retaken, so it offers a duel.
 * Anyone else is sent on: to today's challenge, or to their own result.
 */
export function DailyYou({ name, daily }: { name: string; daily: DailyLinkView | null }) {
  const router = useRouter();
  const [viewer, setViewer] = useState<DailyViewer | null>(null);

  useEffect(() => {
    let live = true;
    apiClient<SuccessEnvelope<DailyViewer>>(`/api/share/daily-links/${encodeURIComponent(name)}/viewer`)
      .then(({ data }) => {
        if (!live) return;
        if (data.isMe) router.replace((data.latestNumber ? resultPath(data.latestNumber) : "/dashboard") as Route);
        else if (!data.today) router.replace(DAILY_START_PATH as Route);
        else setViewer(data);
      })
      .catch(() => {
        if (live) router.replace(DAILY_START_PATH as Route);
      });
    return () => {
      live = false;
    };
  }, [name, router]);

  if (!viewer?.today) {
    return (
      <div className={cn("sb-ui", p.page, p.narrow)}>
        <Bar />
        <p className={p.wait} role="status">Opening today&apos;s challenge…</p>
      </div>
    );
  }
  return <DailySideBySide name={name} daily={daily} viewer={viewer} />;
}

function Bar() {
  return (
    <header className={p.bar}>
      <Link href={"/dashboard" as Route} aria-label="StudyBond dashboard">
        <Image src="/studybond-lockup.png" alt="StudyBond" width={128} height={63} priority className={p.lockup} />
      </Link>
      <Link className={p.login} href={"/dashboard" as Route}>Dashboard</Link>
    </header>
  );
}

/** Both of today's results. Pure, so it can be drawn from sample data. */
export function DailySideBySide({ name, daily, viewer }: { name: string; daily: DailyLinkView | null; viewer: DailyViewer }) {
  const mine = viewer.today!;
  const link = daily?.link ?? null;
  const card = daily?.card ?? null;
  const who = link?.firstName ?? "your friend";
  const theirsToday = Boolean(card?.daily?.isToday);
  const theirScore = theirsToday && card?.showScore && card.exam ? card.exam.score : null;
  const theirTotal = card?.exam?.total ?? null;
  // Only a like-for-like pair gets a winner: same day, same board, both scores shown.
  const fair = theirScore !== null && mine.sameBoard && theirTotal === mine.total;

  let verdict: [string, string];
  if (fair) {
    const gap = theirScore! - mine.score;
    verdict = gap > 0 ? [`${who} took it`, `by ${marksWord(gap)}`] : gap < 0 ? ["You took it", `by ${marksWord(-gap)}`] : ["Level", `${mine.score} each`];
  } else if (theirsToday && !mine.sameBoard) {
    verdict = ["Different boards", "different questions"];
  } else {
    verdict = ["New questions at midnight", ""];
  }

  return (
    <div className={cn("sb-ui", p.page, p.narrow)}>
      <Bar />
      <main className={p.scroll}>
        <section className={p.hero}>
          <h1>{theirsToday ? "You both took today’s challenge" : "You’ve taken today’s challenge"}</h1>
          <p>New questions arrive at midnight. Until then, you can take {who} on in a duel.</p>
        </section>

        <div className={p.slip} aria-label="Today's results">
          <div className={p.hd}>
            <b>Study<span>Bond</span></b>
            <span>Daily Challenge · {todayLine()}</span>
          </div>
          <div className={p.vs}>
            <div>
              {link ? <AvatarArt look={(card?.me ?? link).avatar} size={44} ringOn="#f5c890" /> : null}
              <b>{link?.shortName ?? who}</b>
              <strong>
                {theirScore !== null ? (
                  <>
                    {theirScore}
                    <small>/{theirTotal}</small>
                  </>
                ) : (
                  "–"
                )}
              </strong>
              <em>{!theirsToday ? "Not shared today" : theirScore === null ? "Score hidden" : card?.daily?.timeTaken ?? ""}</em>
            </div>
            <div>
              <AvatarArt look={viewer.you.avatar} size={44} ringOn="#f5c890" />
              <b>You</b>
              <strong>
                {mine.score}
                <small>/{mine.total}</small>
              </strong>
              <em>{mine.timeTaken ?? ""}</em>
            </div>
          </div>
          <div className={p.tear} />
          <div className={p.linkLine}>
            <b>{verdict[0]}</b>
            <span>{verdict[1]}</span>
          </div>
        </div>

        <Link className={p.btn} href={challengePath(name) as Route}>Challenge {who} to a duel</Link>
        <Link className={p.ghost} href={"/dashboard" as Route}>Back to your dashboard</Link>
      </main>
    </div>
  );
}
