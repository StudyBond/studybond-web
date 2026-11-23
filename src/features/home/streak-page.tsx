"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { getUserProfile } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

import { getDashboardHome, getMonthDays, homeKeys } from "./api";
import { monthName, nextFreezeDay, weekday } from "./format";
import { MonthGrid } from "./home-page";
import { ChevronLeft, ChevronRight, FreezeIcon, TickIcon } from "./icons";
import h from "./home.module.css";
import s from "./me.module.css";

function shiftMonth(month: string, by: number): string {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + by);
  return d.toISOString().slice(0, 7);
}

/** Your streak (canvas 16p): the count, this week, records, the month and the rules. */
export function StreakPage() {
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, retry: 1 });
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const d = home.data;
  const [picked, setPicked] = useState<string | null>(null);
  const month = picked ?? d?.month.month ?? null;
  const monthQuery = useQuery({
    queryKey: homeKeys.month(month ?? "none"),
    queryFn: () => getMonthDays(month!),
    enabled: Boolean(month && d && month !== d.month.month),
    staleTime: 5 * 60_000,
  });
  const monthData = d && month === d.month.month ? d.month : monthQuery.data ?? null;

  const streak = d?.streak;
  const today = d?.clock.date ?? "";
  const ticked = Boolean(streak?.studiedToday);

  let stateLine = "";
  if (streak) {
    if (streak.status === "BROKEN" || (streak.count === 0 && streak.longest > 0)) stateLine = "Your last run ended. Finish any paper today to start a new one.";
    else if (streak.count === 0) stateLine = "Finish any paper today to start your first run.";
    else if (ticked) stateLine = `Today is ticked. Come back tomorrow for day ${streak.count + 1}.`;
    else if (streak.freezeMissedDate) stateLine = `You missed ${weekday(streak.freezeMissedDate)}. Finish any paper before midnight and your freeze covers it.`;
    else stateLine = `Today isn’t ticked yet. Finish any paper before midnight to make it ${streak.count + 1}.`;
  }

  /* This week, Monday to Sunday */
  const week = d ? (() => {
    const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
    const st = new Set(d.month.studied);
    const fz = new Set(d.month.frozen);
    return Array.from({ length: 7 }, (_, i) => {
      const key = new Date(Date.parse(`${today}T00:00:00Z`) + (i - dow) * 86_400_000).toISOString().slice(0, 10);
      const cls = st.has(key) ? h.dayDone : fz.has(key) ? h.dayFreeze : key === today ? h.dayToday : key > today ? h.dayLater : "";
      return { key, n: Number(key.slice(8)), label: "MTWTFSS"[i], cls, done: st.has(key), frz: fz.has(key) };
    });
  })() : [];

  const freezeSub = !streak
    ? ""
    : streak.freezes > 0
      ? "Covers one missed day"
      : `Day ${nextFreezeDay(streak.count)} earns your ${streak.count < 7 ? "first" : "next"} one`;

  return (
    <LearnerShell isPremium={d?.plan.isPremium ?? false} profile={profile.data}>
      <div className={cn("sb-ui", h.root, s.wrap)}>
        <Link href={"/dashboard" as Route} className={s.back}><ChevronLeft />Home</Link>
        <h1 className={s.title}>Your streak</h1>

        {!d ? (
          <p className={s.state}>{home.isError ? "We couldn't load your streak. Check your connection and try again." : "Loading your streak..."}</p>
        ) : (
          <>
            <section className={s.hero} aria-label="Streak now">
              <div className={s.big}><b>{streak!.count}</b><span>day{streak!.count === 1 ? "" : "s"} in a row</span></div>
              <p className={s.state}>{stateLine}</p>
              <div className={s.week} aria-label="This week">
                {week.map((day, i) => (
                  <div key={day.key} className={cn(h.day, day.cls)}>
                    <span className={h.mark} style={{ animationDelay: `${i * 60}ms` }}>
                      {day.done ? <TickIcon /> : day.frz ? <FreezeIcon /> : <span className={h.num}>{day.n}</span>}
                    </span>
                    {day.label}
                  </div>
                ))}
              </div>
              {!ticked && (d.challenge.state === "OPEN" || d.challenge.state === "IN_PROGRESS") ? (
                <>
                  <Link href={"/dashboard/practice?mode=DAILY_CHALLENGE" as Route} className={h.btn} style={{ width: "100%", marginTop: 16 }}>
                    Start today&rsquo;s challenge
                  </Link>
                  <span className={s.btnNote}>{d.challenge.subjects.length || d.board.maxSubjects} questions, 3 minutes. Finishing it ticks today.</span>
                </>
              ) : null}
            </section>

            <section className={cn(s.facts, s.facts2)} aria-label="Records">
              <div className={s.fact}><b>{streak!.longest} <small>days</small></b><span>Longest run</span></div>
              <div className={s.fact}><b>{streak!.freezes}</b><span>Streak freezes</span><span className={s.sub}>{freezeSub}</span></div>
            </section>

            <div className={s.hRow}>
              <h3>{month ? monthName(month) : ""}</h3>
              <div className={h.mnav}>
                <span>{monthData ? `${monthData.studied.length} day${monthData.studied.length === 1 ? "" : "s"}` : ""}</span>
                <button type="button" aria-label="Earlier month" disabled={!monthData?.hasEarlier} onClick={() => month && setPicked(shiftMonth(month, -1))}>
                  <ChevronLeft />
                </button>
                <button type="button" aria-label="Later month" disabled={!monthData?.hasLater} onClick={() => month && setPicked(shiftMonth(month, 1))}>
                  <ChevronRight />
                </button>
              </div>
            </div>
            <section className={h.month} aria-label={`Days studied in ${month ? monthName(month) : ""}`}>
              {monthData ? (
                <MonthGrid month={monthData.month} today={monthData.today} studied={monthData.studied} frozen={monthData.frozen} />
              ) : (
                <p className={s.state}>Loading...</p>
              )}
              <div className={h.legend}><span><i className={h.lgS} />Studied</span><span><i className={h.lgF} />Streak freeze used</span></div>
            </section>

            <div className={s.hRow}><h3>How your streak works</h3></div>
            <ul className={s.rules}>
              <li><span className={s.rIc}><TickIcon /></span><span><b>A day counts</b> when you finish any paper before midnight, Lagos time. The 3-minute daily challenge counts too.</span></li>
              <li><span className={cn(s.rIc, s.rIcFz)}><FreezeIcon /></span><span><b>Streak freezes.</b> Day 7 of a run earns one. After that, you earn one every 14 days: day 21, day 35, and so on. You hold one at a time.</span></li>
              <li><span className={cn(s.rIc, s.rIcFz)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h4l3-7 4 14 3-7h4" /></svg></span><span><b>Miss one day</b> while you hold a freeze, and it covers that day when you study the next day. Miss a day with no freeze, or two days in a row, and your run starts again.</span></li>
              <li><span className={s.rIc}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg></span><span><b>Your longest run</b> stays on your record, whatever happens to the current one.</span></li>
            </ul>
          </>
        )}
      </div>
    </LearnerShell>
  );
}
