"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { duelHomeQueryKey, useDuelFaceOff, useDuelFull, useDuelHome, useRivalAnswers } from "@/features/duel/hooks/use-duel-play";
import { useDuelWebsocket } from "@/features/duel/hooks/use-duel-websocket";
import type { ExamResult, UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { firstName } from "../ui/parts";
import { DuelResult } from "./duel-result";
import { Marking } from "./marking";
import { outcomeFor, subjectRows, turnLine } from "./outcome-data";
import m from "./result.module.css";

function seenKey(sessionId: number) {
  return `sb-duel-marked-${sessionId}`;
}

function wasSeen(sessionId: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(seenKey(sessionId)) === "1";
  } catch {
    return false;
  }
}

function markSeen(sessionId: number) {
  try {
    window.localStorage.setItem(seenKey(sessionId), "1");
  } catch {
    // Private mode: the marking just plays again next time.
  }
}

function mmss(seconds: number) {
  const m = Math.floor(seconds / 60);
  const r = seconds % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

/**
 * The results page of a duel exam: marking while the rival writes and then
 * subject by subject, then the result. Marking plays once per duel on this
 * browser; later visits open the result.
 */
export function DuelOutcome({ result, code, profile }: { result: ExamResult; code: string; profile: UserProfile }) {
  const queryClient = useQueryClient();
  const query = useDuelFull(code);
  const duel = query.data?.session ?? null;
  const { data: examProfile } = useExamProfile();
  const completed = duel?.status === "COMPLETED";
  const rivalAnswers = useRivalAnswers(completed && duel ? duel.id : null);
  const home = useDuelHome(completed);
  const faceOff = useDuelFaceOff(completed && duel ? duel.id : null);
  const [rivalQuestion, setRivalQuestion] = useState<number | null>(null);
  const [view, setView] = useState<"marking" | "result" | null>(null);

  const rivalParticipant = duel?.participants.find((p) => p.userId !== profile.id) ?? null;
  const rival = firstName(rivalParticipant?.fullName);

  const refetch = query.refetch;
  useDuelWebsocket({
    sessionId: duel && !completed ? duel.id : null,
    myUserId: profile.id,
    onProgressUpdate: (_from, current) => setRivalQuestion(current),
    onFinished: () => void refetch(),
    onSessionCompleted: () => {
      void refetch();
      void queryClient.invalidateQueries({ queryKey: duelHomeQueryKey });
    },
  });

  const facts = duel ? outcomeFor(duel, profile.id) : null;
  const rivalScore = facts?.rivalScore ?? 0;
  const rows = completed && duel && !rivalAnswers.isLoading ? subjectRows(result, rivalAnswers.data ?? null, rivalScore) : null;

  if (!duel || !facts) {
    return <div className={cn("sb-ui", s.page)}><div className={s.loading}>Opening your duel</div></div>;
  }

  // Marking plays once per duel on this browser.
  const currentView = view ?? (completed && wasSeen(duel.id) ? "result" : "marking");
  const turn = rows ? turnLine(rows, rival, facts.outcome, facts.walkover) : "";
  const correct = result.questions.filter((question) => question.isCorrect).length;
  const me = duel.participants.find((p) => p.userId === profile.id);
  const board = examProfile
    ? examProfile.trackName && !examProfile.institution.name.includes(examProfile.trackName)
      ? `${examProfile.institution.name} ${examProfile.trackName}`
      : examProfile.institution.name
    : "";
  const kick = duel.isTaster
    ? `${firstName(profile.fullName)} v ${rival} · Taster duel · ${duel.totalQuestions} questions`
    : `${firstName(profile.fullName)} v ${rival}${board ? ` · ${board}` : ""} · ${duel.totalQuestions} questions`;
  const timeLeft = duel.durationSeconds ? Math.max(0, duel.durationSeconds - result.timeTakenSeconds) : 0;

  function finishMarking() {
    if (duel) markSeen(duel.id);
    setView("result");
  }

  async function share() {
    // Phase 4 replaces this with the share sheet and its cards.
    const verb = facts!.outcome === "W" ? "won" : facts!.outcome === "L" ? "lost" : "drew";
    const text = `I ${verb} a StudyBond duel ${facts!.myScore}–${facts!.rivalScore}${duel?.isTaster ? " (taster)" : ""}.`;
    try {
      if (navigator.share) await navigator.share({ text, url: window.location.origin });
      else {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
        toast.success("Copied. Paste it anywhere.");
      }
    } catch {
      // The student closed the share menu.
    }
  }

  if (currentView === "marking" || !rows) {
    return (
      <div className={cn("sb-ui", s.page)}>
        <Marking
          title={`${firstName(profile.fullName)} v ${rival}`}
          rival={rival}
          waiting={!completed}
          rivalIn={rivalParticipant?.participantState === "FINISHED"}
          rivalQuestion={rivalQuestion}
          total={duel.totalQuestions}
          myTimeLeft={timeLeft > 0 ? mmss(timeLeft) : null}
          rows={currentView === "marking" ? rows : null}
          outcome={facts.outcome}
          summary={rows ? turn : ""}
          onDone={finishMarking}
        />
      </div>
    );
  }

  const meCard = faceOff.data?.players.find((player) => player.userId === profile.id);
  return (
    <div className={cn("sb-ui", s.page, m.wideResult)}>
      <DuelResult
        duel={duel}
        rival={rival}
        kick={kick}
        outcome={facts.outcome}
        myScore={facts.myScore}
        rivalScore={facts.rivalScore}
        turn={turn}
        rows={rows}
        sp={me?.spEarned ?? null}
        correct={correct}
        home={home.data}
        h2h={faceOff.data?.headToHead ?? null}
        weeklyRank={meCard?.weeklyRank ?? null}
        isPremium={home.data?.freeDuel.isPremium ?? profile.isPremium}
        onShare={share}
      />
    </div>
  );
}
