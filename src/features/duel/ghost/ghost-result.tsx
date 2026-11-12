"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DuelScreen } from "@/features/duel/components/duel-screen";
import { useDuelHome, useGhostResult } from "@/features/duel/hooks/use-duel-play";
import { useExamDetail } from "@/features/exam/hooks/use-exam-detail";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import type { UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { Marking } from "../result/marking";
import { ShareSheet } from "../share/share-sheet";
import { turnLine, type Outcome } from "../result/outcome-data";
import m from "../result/result.module.css";
import s from "../ui/duel.module.css";
import { BackIcon } from "../ui/icons";
import { DuelAvatar, formatLeft, useNow } from "../ui/parts";
import { GhostFace } from "./ghost-race";

export function GhostResultPage({ examId }: { examId: number }) {
  return <DuelScreen errorText="Could not load this race.">{({ profile }) => <GhostResult examId={examId} profile={profile} />}</DuelScreen>;
}

/**
 * After a ghost race: the duel's marking reveal, then a short result built
 * from the duel result boards (6a / 12c) with ghost wording. Ghost races pay
 * normal SP and never count towards rivals or the duel record.
 */
function GhostResult({ examId, profile }: { examId: number; profile: UserProfile }) {
  const now = useNow(30_000);
  const ghost = useGhostResult(examId);
  const exam = useExamDetail(examId);
  const home = useDuelHome();
  const [view, setView] = useState<"marking" | "result">("marking");
  const [shareOpen, setShareOpen] = useState(false);
  const isPremium = home.data?.freeDuel.isPremium ?? profile.isPremium;
  const { data: plan } = useQuery({
    queryKey: ["settings", "subscription-status"],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60_000,
    enabled: !isPremium,
  });

  const rows = useMemo(() => {
    if (!ghost.data || !exam.data) return null;
    const theirs = new Map(ghost.data.ghostAnswers.map((answer) => [answer.questionId, answer.isCorrect]));
    const name = ghost.data.subject ?? exam.data.subjects[0] ?? "The paper";
    const myMarks = exam.data.questions.map((question) => question.isCorrect);
    const theirMarks = exam.data.questions.map((question) => theirs.get(question.id) === true);
    return [{
      name,
      total: myMarks.length,
      mine: myMarks.filter(Boolean).length,
      theirs: theirMarks.filter(Boolean).length,
      myMarks,
      theirMarks,
    }];
  }, [ghost.data, exam.data]);

  if (ghost.isLoading || exam.isLoading || !ghost.data || !rows) {
    return (
      <div className={cn("sb-ui", s.page)}>
        <div className={s.loading}>{ghost.isError ? "This race isn't finished yet." : "Marking your race"}</div>
      </div>
    );
  }

  const data = ghost.data;
  const ghostName = `${data.levelLabel} ghost`;
  const outcome: Outcome = data.result;
  const turn = turnLine(rows, "The ghost", outcome, false);

  if (view === "marking") {
    return (
      <div className={cn("sb-ui", s.page)}>
        <Marking
          title={`You v the ${ghostName}`}
          rival="Ghost"
          waiting={false}
          rivalIn
          rivalQuestion={null}
          total={data.totalQuestions}
          myTimeLeft={null}
          rows={rows}
          outcome={outcome}
          summary={turn}
          onDone={() => setView("result")}
        />
      </div>
    );
  }

  const head =
    outcome === "W"
      ? `You beat the ${ghostName} by ${data.myScore - data.ghostScore}.`
      : outcome === "L"
        ? `The ${ghostName} won by ${data.ghostScore - data.myScore}.`
        : `Dead level with the ${ghostName}.`;
  const free = home.data?.freeDuel;

  return (
    <div className={cn("sb-ui", s.page, m.wideResult)}>
      <header className={s.top}>
        <Link className={s.iconBtn} href={"/dashboard/duel" as Route} aria-label="Back to Duel">
          <BackIcon />
        </Link>
        <h1 className={s.topTitle}>Ghost race result</h1>
      </header>

      {/* Laptop: the verdict on the left; what the race did and the buttons
          on the right, like the duel result. */}
      <div className={m.resultGrid}>
        <div>
          <section className={cn(m.verdict, outcome !== "L" && m.verdictJolt)}>
            {outcome !== "L" && (
              <span className={cn(m.stamp, outcome === "W" ? m.stampWon : m.stampDraw)} aria-hidden="true">{outcome === "W" ? "WON" : "DRAW"}</span>
            )}
            <p className={m.kick}>{data.subject ?? "Ghost race"} · {data.totalQuestions} questions{data.isTaster ? " · Taster" : ""}</p>
            <h2 className={m.head}>{head}</h2>
            <div className={m.scoreline} aria-label={`You ${data.myScore}, ghost ${data.ghostScore}`}>
              <div className={cn(m.slSide, data.myScore < data.ghostScore && m.lose)}>
                <div className={m.ringY}><DuelAvatar self size={52} /></div>
                <b>{data.myScore}</b>
                <span>You</span>
              </div>
              <span className={m.slDash} aria-hidden="true">–</span>
              <div className={cn(m.slSide, data.ghostScore < data.myScore && m.lose)}>
                <GhostFace size={52} />
                <b>{data.ghostScore}</b>
                <span>Ghost</span>
              </div>
            </div>
            <p className={m.turn}>{turn}</p>
          </section>
        </div>

        <div>
          <section className={m.block}>
            <h3 className={m.h}>What this race did</h3>
            <ul className={m.got}>
              <li>
                <span><b>Study Points</b><small>{rows[0].mine} correct at the normal rate. Ghost races pay 1×.</small></span>
                <span className={cn(m.val, m.sp)}>+{data.spEarned} SP</span>
              </li>
              <li>
                <span><b>Your duel record</b><small>Ghost races don&apos;t count towards rivals or your record.</small></span>
                <span className={m.val}>–</span>
              </li>
            </ul>
          </section>

          <div className={m.actions}>
            {!isPremium && free ? (
              <div className={m.freebox}>
                <b>That was your free duel this week</b>
                <p>Race a ghost or a friend again on Sunday, or go premium for three ghost races a day and full duels.</p>
                <span className={m.when}>Next free duel in {formatLeft(new Date(free.nextFreeDuelAt).getTime() - now)}</span>
                <Link className={cn(s.btn, s.ink, s.wide)} href={"/dashboard/settings?tab=subscription" as Route}>
                  See premium
                </Link>
                {plan && (
                  <small>₦{plan.priceNaira.toLocaleString("en-NG")} for {plan.durationMonths} month{plan.durationMonths === 1 ? "" : "s"} · unlimited duels</small>
                )}
              </div>
            ) : (
              <Link className={cn(s.btn, s.ink, s.wide)} href={"/dashboard/duel/ghost" as Route}>
                Race another ghost
              </Link>
            )}
            <div className={m.row}>
              <Link className={cn(s.btn, s.line)} href={`/exams/${examId}/results` as Route}>Review answers</Link>
              <button type="button" className={cn(s.btn, s.line)} onClick={() => setShareOpen(true)}>
                Share result
              </button>
            </div>
            <Link className={cn(s.btn, s.line, s.wide)} href={"/dashboard/duel" as Route}>Back to Duel</Link>
          </div>
        </div>
      </div>
      <ShareSheet examId={examId} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
