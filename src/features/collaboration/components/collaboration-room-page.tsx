"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  ClipboardCopy,
  Crown,
  Loader2,
  PencilLine,
  Radio,
  RefreshCcw,
  ShieldOff,
  Sparkles,
  Swords,
  TimerReset,
  Users2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { InlineError } from "@/components/ui/inline-error";
import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";
import {
  collaborationSessionQueryKey,
  useCancelCollaborationMutation,
  useCollaborationSession,
  useJoinCollaborationMutation,
  useLeaveCollaborationMutation,
  useRenameCollaborationMutation,
  useStartCollaborationMutation,
} from "@/features/collaboration/hooks/use-collaboration";
import { getQuestionSourceMeta } from "@/features/collaboration/lib/collaboration-config";
import { rememberCollaborationRoom } from "@/features/collaboration/lib/recent-room-store";
import { offlineStore } from "@/features/exam/stores/offline-store";
import { getExamQuestions } from "@/lib/api/exams";
import type {
  CollaborationParticipant,
  CollaborationSessionStatus,
  CollaborationStartResult,
  ExamSessionData,
  UserProfile,
  UserStats,
} from "@/lib/api/types";

type CollaborationRoomPageProps = {
  code: string;
  profile: UserProfile;
  stats: UserStats;
};

function formatStatusLabel(status: CollaborationSessionStatus) {
  return status.replaceAll("_", " ");
}

function getStatusTone(status: CollaborationSessionStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  return "accent";
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function participantTone(state: CollaborationParticipant["participantState"]) {
  if (state === "FINISHED") return "success";
  if (state === "DISCONNECTED") return "danger";
  return "neutral";
}

function buildExamSessionData(
  started: CollaborationStartResult,
  myExamId: number,
) {
  return {
    examId: myExamId,
    examType: started.session.sessionType,
    subjects: started.session.subjects,
    sessionNumber: started.session.sessionNumber,
    displayNameLong: started.session.displayNameLong,
    displayNameShort: started.session.displayNameShort,
    totalQuestions: started.session.totalQuestions,
    timeAllowedSeconds: started.timeAllowedSeconds,
    startedAt: started.startedAt,
    expiresAt: started.expiresAt,
    questions: started.questions,
  };
}

function RoomParticipantCard({
  participant,
  isHost,
  isMe,
}: {
  participant: CollaborationParticipant;
  isHost: boolean;
  isMe: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,rgba(224,144,64,0.25),rgba(255,255,255,0.06))] text-sm font-semibold text-white">
            {getInitials(participant.fullName)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-white/85">
                {participant.fullName}
              </p>
              {isMe ? <Badge tone="accent">You</Badge> : null}
              {isHost ? <Badge tone="neutral">Host</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-white/35">
              Joined the room and synced for the same paper.
            </p>
          </div>
        </div>
        <Badge tone={participantTone(participant.participantState)}>
          {participant.participantState}
        </Badge>
      </div>

      {participant.finalRank ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="success">Rank #{participant.finalRank}</Badge>
          {participant.score !== null ? (
            <Badge tone="neutral">Score {participant.score}</Badge>
          ) : null}
          {participant.spEarned !== null ? (
            <Badge tone="accent">+{participant.spEarned} SP</Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function CollaborationRoomPage({
  code,
  profile,
  stats,
}: CollaborationRoomPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const sessionQuery = useCollaborationSession(code);
  const joinMutation = useJoinCollaborationMutation();
  const startMutation = useStartCollaborationMutation();
  const leaveMutation = useLeaveCollaborationMutation();
  const cancelMutation = useCancelCollaborationMutation();
  const renameMutation = useRenameCollaborationMutation();

  const [roomError, setRoomError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const snapshot = sessionQuery.data;
  const session = snapshot?.session;
  const myExamId = snapshot?.myExamId ?? null;
  const isEligible = stats.isPremium && stats.realExamsCompleted >= 2;

  const me = useMemo(
    () =>
      session?.participants.find((item) => item.userId === profile.id) ?? null,
    [profile.id, session?.participants],
  );
  const isParticipant = !!me;
  const isHost = !!session && session.hostUserId === profile.id;
  const sourceMeta = session
    ? getQuestionSourceMeta(session.questionSource)
    : null;
  const canJoin =
    !!session &&
    !isParticipant &&
    session.status === "WAITING" &&
    session.participants.length < session.maxParticipants &&
    isEligible;
  const canStart =
    !!session &&
    isHost &&
    session.status === "WAITING" &&
    session.participants.length >= session.maxParticipants;
  const canRename = !!session && isHost && session.status === "WAITING";
  const canCancel =
    !!session &&
    isHost &&
    (session.status === "WAITING" || session.status === "IN_PROGRESS");
  const canLeave =
    !!session &&
    isParticipant &&
    !isHost &&
    (session.status === "WAITING" || session.status === "IN_PROGRESS");

  useEffect(() => {
    if (!session) return;
    rememberCollaborationRoom(session);
  }, [session]);

  // Ref to track if we have already initiated the launch to the exam arena.
  // This prevents multiple redirects or race conditions during rapid state updates.
  const launchInitiatedRef = useRef(false);

  // Reset launching state when session status changes away from IN_PROGRESS
  // (Safe to call setState here: status change doesn't depend on isLaunching, prevents cascading)
  useEffect(() => {
    if (session?.status !== "IN_PROGRESS") {
      launchInitiatedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLaunching(false);
    }
  }, [session?.status]);

  useEffect(() => {
    // If the session isn't in progress or we don't have an exam ID, we can't launch.
    if (!session || !myExamId || session.status !== "IN_PROGRESS") {
      return;
    }

    // If we've already started the launch process for this specific session status, stay the course.
    if (launchInitiatedRef.current) return;

    const examId = myExamId;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function prepareLaunch() {
      setRoomError(null);
      setIsLaunching(true);
      launchInitiatedRef.current = true;

      const cachedSession = queryClient.getQueryData<ExamSessionData>([
        "exam-session",
        examId,
      ]);

      if (!cachedSession) {
        try {
          const examSession = await getExamQuestions(examId);
          if (cancelled) return;

          queryClient.setQueryData(["exam-session", examId], examSession);
          await offlineStore.saveExamSession(examId, examSession);
        } catch (error) {
          if (cancelled) return;

          setIsLaunching(false);
          launchInitiatedRef.current = false;
          setRoomError(
            error instanceof Error
              ? error.message
              : "Your exam is live, but the paper is not ready to open yet.",
          );
          toast.error(
            "The duel is live, but we could not load your paper yet.",
          );
          return;
        }
      }

      // If we are still active, schedule the redirect.
      timer = setTimeout(() => {
        router.push(`/exams/${examId}` as Route);
      }, 900);
    }

    prepareLaunch().catch(() => {
      if (cancelled) return;
      setIsLaunching(false);
      launchInitiatedRef.current = false;
    });

    return () => {
      cancelled = true;
      // CRITICAL: We DO NOT clear the timer here if the status is still IN_PROGRESS.
      // If a background poll triggers a re-render, we want the existing redirect to finish.
      // The `launchInitiatedRef` ensures we don't start a second one.
      if (session?.status !== "IN_PROGRESS" && timer) {
        clearTimeout(timer);
      }
    };
  }, [myExamId, queryClient, router, session, session?.status]);

  async function handleCopyInvite() {
    if (!session) return;

    const inviteUrl = `${window.location.origin}/dashboard/collaboration/${session.code}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Could not copy the invite link on this device.");
    }
  }

  async function handleJoin() {
    if (!session) return;
    setRoomError(null);

    try {
      const data = await joinMutation.mutateAsync(session.code);
      rememberCollaborationRoom(data.session);
      toast.success("You are in. Waiting for the host to launch.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not join the room.";
      setRoomError(message);
    }
  }

  async function handleStart() {
    if (!session) return;
    setRoomError(null);

    try {
      const data = await startMutation.mutateAsync(session.id);
      rememberCollaborationRoom(data.session);

      const assignedExamId =
        data.myExamId ??
        data.examAssignments.find((item) => item.userId === profile.id)
          ?.examId ??
        null;

      if (assignedExamId) {
        const examSession = buildExamSessionData(data, assignedExamId);
        queryClient.setQueryData(["exam-session", assignedExamId], examSession);
        await offlineStore.saveExamSession(assignedExamId, examSession);
      }

      toast.success("Room launched. Moving both players into the duel.");
      setIsLaunching(true);
      queryClient.setQueryData(
        collaborationSessionQueryKey(data.session.code),
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start the room.";
      setRoomError(message);
    }
  }

  async function handleRename() {
    if (!session) return;
    setRoomError(null);

    try {
      const trimmed = nameDraft.trim();
      const data = await renameMutation.mutateAsync({
        sessionId: session.id,
        customName: trimmed.length > 0 ? trimmed : null,
      });
      rememberCollaborationRoom(data.session);
      setIsEditingName(false);
      toast.success("Room name updated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not update the room name.";
      setRoomError(message);
    }
  }

  async function handleLeave() {
    if (!session) return;
    setRoomError(null);

    try {
      const data = await leaveMutation.mutateAsync(session.id);
      rememberCollaborationRoom(data.session);
      toast.success("You left the room.");
      router.push("/dashboard/collaboration" as Route);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not leave the room.";
      setRoomError(message);
    }
  }

  async function handleCancel() {
    if (!session) return;
    setRoomError(null);

    try {
      const data = await cancelMutation.mutateAsync(session.id);
      rememberCollaborationRoom(data.session);
      toast.success("Room cancelled.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not cancel the room.";
      setRoomError(message);
    }
  }

  function handleToggleNameEditing() {
    if (!session) return;

    if (isEditingName) {
      setIsEditingName(false);
      return;
    }

    setNameDraft(session.customName ?? "");
    setIsEditingName(true);
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[420px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (sessionQuery.isError || !session || !sourceMeta) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="This collaboration room could not be loaded"
          description={
            (sessionQuery.error as Error)?.message ||
            "The invite may be expired, cancelled, or unavailable right now."
          }
          actionLabel="Back to collaboration"
          onAction={() => router.push("/dashboard/collaboration" as Route)}
        />
      </div>
    );
  }

  const roomTone = getStatusTone(session.status);

  return (
    <div className="space-y-8">
      {isLaunching ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#09090b]/95 backdrop-blur-xl">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[radial-gradient(circle,rgba(224,144,64,0.18),rgba(224,144,64,0.04))] text-[var(--sb-accent)] shadow-[0_0_50px_var(--sb-accent-glow)]">
              <Swords className="h-8 w-8" />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">
              Room syncing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Your duel is live.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              StudyBond is aligning the shared paper and moving you into the
              exam arena.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Launching now
            </div>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(224,144,64,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.1),transparent_28%),linear-gradient(140deg,#0b0c0f_0%,#101116_45%,#09090b_100%)] px-5 py-7 sm:px-8 sm:py-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={roomTone} dot>
                {formatStatusLabel(session.status)}
              </Badge>
              <Badge tone="neutral">{session.code}</Badge>
              <Badge tone="neutral">{sourceMeta.label}</Badge>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/28">
                Collaboration Room
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  {session.effectiveDisplayName}
                </h1>
                {canRename ? (
                  <button
                    type="button"
                    onClick={handleToggleNameEditing}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/45 transition-all hover:border-white/[0.14] hover:text-white/75"
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-white/45 sm:text-base">
                {session.status === "WAITING"
                  ? "The room is staged and listening. Invite your second player, tune the name if you want, and launch once both seats are filled."
                  : session.status === "IN_PROGRESS"
                    ? "This duel is active. StudyBond will keep syncing the room status while the exam runs."
                    : session.status === "COMPLETED"
                      ? "The room has finished. Scores, rank order, and room identity are now sealed."
                      : "This room has been closed. You can spin up a fresh collaboration session whenever you want."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {session.subjects.map((subject) => (
                <Badge key={subject} tone="neutral">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <Surface className="bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-white/75">
                <Users2 className="h-4 w-4 text-sky-300" />
                <span className="text-sm font-medium">
                  {session.participants.length}/{session.maxParticipants} seated
                </span>
              </div>
              <p className="mt-2 text-sm text-white/40">
                {session.status === "WAITING"
                  ? "The host can launch once every seat is occupied."
                  : "Player state continues updating from the live session snapshot."}
              </p>
            </Surface>

            <Surface className="bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-white/75">
                <TimerReset className="h-4 w-4 text-[var(--sb-accent)]" />
                <span className="text-sm font-medium">
                  Session #{session.sessionNumber}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/40">
                Same paper, same timing discipline, same scoreboard at the end.
              </p>
            </Surface>
          </div>
        </div>
      </section>

      {roomError ? <InlineError message={roomError} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {isEditingName ? (
            <Surface className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium tracking-wide text-white/50">
                    Room Name
                  </label>
                  <input
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    maxLength={60}
                    className="mt-1.5 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[var(--sb-accent)]/35 focus:ring-2 focus:ring-[var(--sb-accent)]/15"
                    placeholder="Name this duel room"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditingName(false)}
                  >
                    Keep current
                  </Button>
                  <Button
                    onClick={handleRename}
                    isLoading={renameMutation.isPending}
                  >
                    Save room name
                  </Button>
                </div>
              </div>
            </Surface>
          ) : null}

          <Surface className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Player grid</p>
                <p className="mt-1 text-sm text-white/40">
                  Everyone visible, nobody guessing who is in, and clear state
                  labels when the room starts moving.
                </p>
              </div>
              <Badge tone={roomTone}>
                {session.participants.length} players
              </Badge>
            </div>

            <div className="grid gap-4">
              {session.participants.map((participant) => (
                <RoomParticipantCard
                  key={participant.userId}
                  participant={participant}
                  isHost={participant.userId === session.hostUserId}
                  isMe={participant.userId === profile.id}
                />
              ))}

              {session.participants.length < session.maxParticipants ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-5">
                  <p className="text-sm font-medium text-white/72">
                    Open seat waiting
                  </p>
                  <p className="mt-1 text-sm text-white/38">
                    Share the room code and invite one more student to occupy
                    the final slot.
                  </p>
                </div>
              ) : null}
            </div>
          </Surface>

          {session.status === "COMPLETED" ? (
            <Surface className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Crown className="h-4 w-4 text-[var(--sb-gold)]" />
                <p className="text-sm font-medium text-white/82">
                  Final room result
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {session.participants
                  .slice()
                  .sort((left, right) => {
                    const leftRank = left.finalRank ?? Number.MAX_SAFE_INTEGER;
                    const rightRank =
                      right.finalRank ?? Number.MAX_SAFE_INTEGER;
                    return leftRank - rightRank;
                  })
                  .map((participant) => (
                    <div
                      key={participant.userId}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white/82">
                            {participant.fullName}
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            {participant.userId === profile.id
                              ? "Your finish line"
                              : "Opponent finish line"}
                          </p>
                        </div>
                        {participant.finalRank ? (
                          <Badge tone="success">#{participant.finalRank}</Badge>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {participant.score !== null ? (
                          <Badge tone="neutral">
                            {participant.score} correct
                          </Badge>
                        ) : null}
                        {participant.spEarned !== null ? (
                          <Badge tone="accent">
                            +{participant.spEarned} SP
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            </Surface>
          ) : null}
        </div>

        <div className="space-y-6">
          <Surface className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/82">
                  Room controls
                </p>
                <p className="mt-1 text-sm text-white/40">
                  Invite, join, launch, or exit without losing clarity about
                  what happens next.
                </p>
              </div>
              <Badge tone="neutral">{session.code}</Badge>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCopyInvite}
              >
                <ClipboardCopy className="h-4 w-4" />
                Copy invite link
              </Button>

              {canJoin ? (
                <Button
                  className="w-full"
                  onClick={handleJoin}
                  isLoading={joinMutation.isPending}
                >
                  Join this room
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}

              {canStart ? (
                <Button
                  className="w-full"
                  onClick={handleStart}
                  isLoading={startMutation.isPending}
                >
                  Start duel now
                  <Sparkles className="h-4 w-4" />
                </Button>
              ) : null}

              {session.status === "IN_PROGRESS" && myExamId ? (
                <Button
                  asChild
                  className="w-full"
                  href={`/exams/${myExamId}` as Route}
                >
                  <>
                    Enter my exam
                    <ArrowRight className="h-4 w-4" />
                  </>
                </Button>
              ) : null}

              {session.status === "COMPLETED" && myExamId ? (
                <Button
                  asChild
                  className="w-full"
                  href={`/exams/${myExamId}/results` as Route}
                >
                  <>
                    View my results
                    <ArrowRight className="h-4 w-4" />
                  </>
                </Button>
              ) : null}

              {canLeave ? (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={handleLeave}
                  isLoading={leaveMutation.isPending}
                >
                  <ShieldOff className="h-4 w-4" />
                  Leave room
                </Button>
              ) : null}

              {canCancel ? (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={handleCancel}
                  isLoading={cancelMutation.isPending}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel room
                </Button>
              ) : null}

              <Button
                asChild
                variant="ghost"
                className="w-full"
                href={"/dashboard/collaboration" as Route}
              >
                <>
                  Back to collaboration hub
                  <RefreshCcw className="h-4 w-4" />
                </>
              </Button>
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Radio className="h-4 w-4 text-sky-300" />
              <p className="text-sm font-medium text-white/82">Room logic</p>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-white/42">
              <p>
                Only the host can launch the room, rename it while waiting, or
                cancel it for everyone.
              </p>
              <p>
                When the duel starts, StudyBond routes each player to their own
                synced exam assignment using the same shared paper.
              </p>
              <p>
                After completion, this room becomes the clean summary layer for
                player order, score, and room identity.
              </p>
            </div>
          </Surface>

          {!isEligible ? (
            <Surface tone="warm" className="p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldOff className="h-4 w-4 text-[var(--sb-gold)]" />
                <p className="text-sm font-medium text-white/82">
                  Collaboration access locked
                </p>
              </div>
              <p className="text-sm leading-relaxed text-white/45">
                You can view this room, but you need premium plus two completed
                real exams before you can take a seat in it.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {!stats.isPremium ? (
                  <Button asChild href={"/dashboard/settings" as Route}>
                    <>
                      Upgrade now
                      <Crown className="h-4 w-4" />
                    </>
                  </Button>
                ) : (
                  <Button asChild href={"/dashboard/practice" as Route}>
                    <>
                      Finish unlock exams
                      <ArrowRight className="h-4 w-4" />
                    </>
                  </Button>
                )}
              </div>
            </Surface>
          ) : null}
        </div>
      </section>
    </div>
  );
}
