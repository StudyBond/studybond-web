"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DuelScreen } from "@/features/duel/components/duel-screen";
import { useCancelDuelMutation, useLeaveDuelMutation } from "@/features/duel/hooks/use-duel";
import { useDuelFaceOff, useDuelFull } from "@/features/duel/hooks/use-duel-play";
import { useDuelWebsocket } from "@/features/duel/hooks/use-duel-websocket";
import { offlineStore } from "@/features/exam/stores/offline-store";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { DuelSessionFull } from "@/lib/api/duel";
import { getExamQuestions } from "@/lib/api/exams";
import type { ExamSessionData, UserProfile, UserStats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { sourceLabel } from "../ui/duel-slip";
import { BackIcon } from "../ui/icons";
import { apiErrorMessage, firstName, headToHeadLine, minutesLabel, printedCode, useNow } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import { FaceOff } from "./face-off";
import { JoinView } from "./join-view";
import r from "./room.module.css";
import { SlipView } from "./slip-view";

function boardLabel(name: string | undefined, trackName: string | undefined) {
  if (!name) return "";
  return trackName && !name.includes(trackName) ? `${name} ${trackName}` : name;
}

export function DuelRoomPage({ code }: { code: string }) {
  return (
    <DuelScreen errorText="Could not load this duel.">
      {({ profile, stats }) => <DuelRoom code={code} profile={profile} stats={stats} />}
    </DuelScreen>
  );
}

/**
 * /dashboard/duel/[code]. One page for the whole lobby:
 * - the host waits with the printed slip until a friend joins;
 * - anyone else who opens the link sees the slip and joins;
 * - both meet at the face-off, tap ready, count down, and go to the paper;
 * - later visits forward to the paper (still writing) or the result.
 */
function DuelRoom({ code, profile, stats }: { code: string; profile: UserProfile; stats: UserStats }) {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const query = useDuelFull(code);
  const { data: examProfile } = useExamProfile();
  const leave = useLeaveDuelMutation();
  const cancel = useCancelDuelMutation();
  const now = useNow(5000);

  const duel = query.data?.session ?? null;
  const myExamId = query.data?.myExamId ?? null;
  const me = duel?.participants.find((participant) => participant.userId === profile.id) ?? null;
  const rival = duel?.participants.find((participant) => participant.userId !== profile.id) ?? null;
  const isHost = Boolean(duel && duel.hostUserId === profile.id);
  const host = duel?.participants.find((participant) => participant.userId === duel.hostUserId) ?? null;
  const board = boardLabel(examProfile?.institution.name, examProfile?.trackName);

  // The host stays on the slip after a friend joins until they tap "Go to the duel".
  const printed = params.get("printed") === "1";
  const [entered, setEntered] = useState(!printed);
  const faceOffOpen = Boolean(duel && me && rival && duel.status === "WAITING" && (!isHost || entered));

  // Head-to-head for the "Tobi A. joined" line.
  const faceOff = useDuelFaceOff(rival && isHost ? duel?.id ?? null : null);
  const rivalLine = useMemo(() => {
    const player = faceOff.data?.players.find((p) => p.userId === rival?.userId);
    const h2h = faceOff.data?.headToHead;
    const bits = [player?.course, h2h ? headToHeadLine(h2h.wins, h2h.losses, firstName(rival?.fullName)) : null].filter(Boolean);
    return bits.join(" · ");
  }, [faceOff.data, rival]);

  // Live: ready taps and the start reach us before the next poll.
  const refetch = query.refetch;
  useDuelWebsocket({
    sessionId: duel && me && duel.status !== "COMPLETED" && duel.status !== "CANCELLED" ? duel.id : null,
    myUserId: profile.id,
    onPlayerReady: () => void refetch(),
    onSessionStarted: () => void refetch(),
    onSessionCancelled: () => void refetch(),
  });

  // Seeing it start from the face-off runs the countdown; arriving later skips it.
  const [sawWaiting, setSawWaiting] = useState(false);
  if (!sawWaiting && duel?.status === "WAITING" && me && rival) setSawWaiting(true);
  const started = duel?.status === "IN_PROGRESS";

  // Get the paper ready during the countdown, so it opens straight away.
  const prefetched = useRef(false);
  useEffect(() => {
    if (!started || !myExamId || prefetched.current) return;
    prefetched.current = true;
    if (queryClient.getQueryData<ExamSessionData>(["exam-session", myExamId])) return;
    getExamQuestions(myExamId)
      .then(async (paper) => {
        queryClient.setQueryData(["exam-session", myExamId], paper);
        await offlineStore.saveExamSession(myExamId, paper);
      })
      .catch(() => undefined);
  }, [started, myExamId, queryClient]);

  const openPaper = useCallback(() => {
    if (!myExamId || !duel) return;
    router.push(`/exams/${myExamId}?duel=${duel.code}` as Route);
  }, [myExamId, duel, router]);

  // Later visits: still writing -> the paper; finished or marked -> the result.
  useEffect(() => {
    if (!duel || !me || !myExamId) return;
    const finished = me.participantState === "FINISHED" || Boolean(me.finishedAt);
    if (duel.status === "COMPLETED" || (duel.status === "IN_PROGRESS" && finished)) {
      router.replace(`/exams/${myExamId}/results?duel=${duel.code}` as Route);
    } else if (duel.status === "IN_PROGRESS" && !sawWaiting) {
      router.replace(`/exams/${myExamId}?duel=${duel.code}` as Route);
    }
  }, [duel, me, myExamId, sawWaiting, router]);

  async function leaveDuel() {
    if (!duel) return;
    try {
      if (isHost) await cancel.mutateAsync(duel.id);
      else await leave.mutateAsync(duel.id);
      playDuelSound("remove");
      router.push("/dashboard/duel" as Route);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not leave the duel."));
    }
  }

  const title = duel && rival && me ? `${firstName(isHost ? profile.fullName : host?.fullName)} v ${firstName(isHost ? rival.fullName : profile.fullName)}` : duel && isHost && duel.status === "WAITING" ? "Challenge a friend" : duel?.isTaster ? "Taster duel" : "Duel";

  return (
    <div className={cn("sb-ui", s.page, r.roomPage)}>
      <header className={s.top}>
        <Link className={s.iconBtn} href={"/dashboard/duel" as Route} aria-label="Back to Duel">
          <BackIcon />
        </Link>
        <h1 className={s.topTitle}>{title}</h1>
        {duel && <span className={r.topCode}>{printedCode(duel.code)}</span>}
      </header>

      {query.isLoading ? (
        <div className={s.loading}>Opening the duel</div>
      ) : !duel ? (
        <RoomState title="We couldn't find that duel" body="Check the code on the slip, or ask your friend to send the link again." />
      ) : (
        <RoomBody
          duel={duel}
          profile={profile}
          stats={stats}
          board={board}
          isHost={isHost}
          hostName={host?.fullName ?? profile.fullName}
          me={me}
          rival={rival}
          rivalLine={rivalLine}
          faceOffOpen={faceOffOpen}
          started={Boolean(started && sawWaiting)}
          now={now}
          onEnter={() => {
            playDuelSound("go");
            setEntered(true);
          }}
          onCountdownDone={openPaper}
          onLeave={leaveDuel}
          leaving={leave.isPending || cancel.isPending}
        />
      )}
    </div>
  );
}

function RoomBody({
  duel,
  profile,
  stats,
  board,
  isHost,
  hostName,
  me,
  rival,
  rivalLine,
  faceOffOpen,
  started,
  now,
  onEnter,
  onCountdownDone,
  onLeave,
  leaving,
}: {
  duel: DuelSessionFull;
  profile: UserProfile;
  stats: UserStats;
  board: string;
  isHost: boolean;
  hostName: string;
  me: DuelSessionFull["participants"][number] | null;
  rival: DuelSessionFull["participants"][number] | null;
  rivalLine: string;
  faceOffOpen: boolean;
  started: boolean;
  now: number;
  onEnter: () => void;
  onCountdownDone: () => void;
  onLeave: () => void;
  leaving: boolean;
}) {
  const expired = duel.status === "WAITING" && !rival && Boolean(duel.expiresAt && new Date(duel.expiresAt).getTime() <= now);

  if (duel.status === "CANCELLED") {
    return (
      <RoomState
        title={duel.declinedAt ? `${firstName(rival?.fullName ?? "They")} said not now` : "This duel was called off"}
        body="Nothing was played, so nobody gained or lost anything."
      />
    );
  }

  if (expired) {
    return (
      <RoomState
        title="This slip has expired"
        body={isHost ? "Slips last 30 minutes. Make a new one and send it again." : `Slips last 30 minutes. Ask ${firstName(hostName)} for a new one.`}
        action={isHost ? { href: "/dashboard/duel/new", label: "Make a new slip" } : undefined}
      />
    );
  }

  if (!me) {
    if (duel.status !== "WAITING" || duel.participants.length >= 2) {
      return <RoomState title="This duel is already full" body="Two people are in it already. Ask your friend for a new slip." />;
    }
    return (
      <div className={r.narrow}>
        <JoinView duel={duel} profile={profile} stats={stats} hostName={hostName} board={board} />
      </div>
    );
  }

  const paperLine = (
    <>
      {board && <b>{board}</b>}
      {board && " · "}
      {sourceLabel(duel)} · {duel.subjects.join(", ")} · <span className="ui-num">{duel.totalQuestions}</span> questions
      {duel.durationSeconds ? <> · <span className="ui-num">{Math.round(duel.durationSeconds / 60)}</span> min</> : null}
    </>
  );

  if (faceOffOpen || started) {
    return (
      <FaceOff
        duel={duel}
        myUserId={profile.id}
        myName={profile.fullName}
        paperLine={paperLine}
        started={started}
        onCountdownDone={onCountdownDone}
        onLeave={onLeave}
        leaving={leaving}
      />
    );
  }

  if (isHost && duel.status === "WAITING") {
    return (
      <div className={r.narrow}>
        <SlipView duel={duel} hostName={hostName} boardName={board} rival={rival} rivalLine={rivalLine} onGo={onEnter} />
        {!rival && (
          <p className={r.note}>
            Keep this page open or come back to it. The slip lasts{" "}
            {duel.expiresAt ? minutesLabel(Math.max(60, (new Date(duel.expiresAt).getTime() - now) / 1000)).replace(" min", " more minutes") : "30 minutes"}.
          </p>
        )}
      </div>
    );
  }

  return <div className={s.loading}>Opening your paper</div>;
}

export function RoomState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className={r.state}>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link className={cn(s.btn, action ? s.ink : s.line)} style={{ marginTop: 8 }} href={(action?.href ?? "/dashboard/duel") as Route}>
        {action?.label ?? "Back to Duel"}
      </Link>
    </div>
  );
}
