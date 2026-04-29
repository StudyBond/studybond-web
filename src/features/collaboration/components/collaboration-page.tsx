"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Crown,
  DoorOpen,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import { Surface } from "@/components/ui/surface";
import {
  useCreateCollaborationMutation,
  useJoinCollaborationMutation,
} from "@/features/collaboration/hooks/use-collaboration";
import {
  collaborationQuestionSources,
  collaborationSubjects,
  getCollaborationHeadline,
  getCollaborationStatChips,
  getQuestionSourceMeta,
} from "@/features/collaboration/lib/collaboration-config";
import {
  getRecentCollaborationRooms,
  rememberCollaborationRoom,
  type RecentCollaborationRoom,
} from "@/features/collaboration/lib/recent-room-store";
import type { Subject } from "@/lib/api/exams";
import type {
  CollaborationQuestionSource,
  UserProfile,
  UserStats,
} from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type CollaborationPageProps = {
  profile: UserProfile;
  stats: UserStats;
};

function sanitizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function CollaborationPage({
  profile,
  stats,
}: CollaborationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateCollaborationMutation();
  const joinMutation = useJoinCollaborationMutation();

  const [questionSource, setQuestionSource] =
    useState<CollaborationQuestionSource>("REAL_PAST_QUESTION");
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([
    "English",
    "Mathematics",
  ]);
  const [customName, setCustomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [recentRooms, setRecentRooms] = useState<RecentCollaborationRoom[]>([]);

  const isEligible = stats.isPremium && stats.realExamsCompleted >= 2;
  const isPremiumLocked = !stats.isPremium;
  const needsMoreRealExams = stats.isPremium && stats.realExamsCompleted < 2;
  const maxSubjects = questionSource === "MIXED" ? 3 : 4;

  useEffect(() => {
    setRecentRooms(getRecentCollaborationRooms());
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setJoinCode(sanitizeCode(code));
    }
  }, [searchParams]);

  const sourceMeta = getQuestionSourceMeta(questionSource);
  const SourceIcon = sourceMeta.icon;
  const statChips = getCollaborationStatChips(stats.realExamsCompleted);
  const seatsFilled = Math.min(selectedSubjects.length, maxSubjects);
  const formTone = isEligible ? "accent" : "default";

  const playlistLine = useMemo(() => {
    if (questionSource === "MIXED") {
      return "Mixed rooms cap at three subjects to keep the sprint sharp and fair.";
    }

    if (selectedSubjects.length === 4) {
      return "English anchors every full four-subject duel to mirror the real admission rhythm.";
    }

    return "Pick the subjects that will make both players feel the pressure immediately.";
  }, [questionSource, selectedSubjects.length]);

  function toggleSubject(subject: Subject) {
    setFormError(null);

    const exists = selectedSubjects.includes(subject);
    if (exists) {
      if (
        questionSource !== "MIXED" &&
        selectedSubjects.length === 4 &&
        subject === "English"
      ) {
        setFormError("English stays locked in once you build a full four-subject duel.");
        return;
      }

      setSelectedSubjects((current) => current.filter((item) => item !== subject));
      return;
    }

    if (selectedSubjects.length >= maxSubjects) {
      setFormError(
        questionSource === "MIXED"
          ? "Mixed sprint rooms can only hold three subjects."
          : "You already have a full collaboration set.",
      );
      return;
    }

    if (
      questionSource !== "MIXED" &&
      selectedSubjects.length === 3 &&
      !selectedSubjects.includes("English") &&
      subject !== "English"
    ) {
      setFormError("English must complete any four-subject collaboration exam.");
      return;
    }

    setSelectedSubjects((current) => [...current, subject]);
  }

  async function handleCreateRoom() {
    if (!isEligible) return;
    if (selectedSubjects.length === 0) {
      setFormError("Choose at least one subject before opening a room.");
      return;
    }

    setFormError(null);

    try {
      const data = await createMutation.mutateAsync({
        sessionType: "ONE_V_ONE_DUEL",
        institutionCode: stats.institution.code,
        questionSource,
        subjects: selectedSubjects,
        customName: customName.trim() || null,
        maxParticipants: 2,
      });

      rememberCollaborationRoom(data.session);
      toast.success("Room created. Your invite link is ready.");
      router.push(`/dashboard/collaboration/${data.session.code}` as Route);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create the room.";
      setFormError(message);
    }
  }

  async function handleJoinRoom() {
    const nextCode = sanitizeCode(joinCode);
    if (!nextCode) {
      setFormError("Paste or type a valid room code.");
      return;
    }

    if (!isEligible) return;

    setFormError(null);

    try {
      const data = await joinMutation.mutateAsync(nextCode);
      rememberCollaborationRoom(data.session);
      toast.success("Room joined. Syncing the lobby...");
      router.push(`/dashboard/collaboration/${data.session.code}` as Route);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not join that room.";
      setFormError(message);
    }
  }

  async function handlePasteCode() {
    try {
      const value = await navigator.clipboard.readText();
      setJoinCode(sanitizeCode(value));
    } catch {
      toast.error("Clipboard access is blocked on this device.");
    }
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(224,144,64,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.12),transparent_28%),linear-gradient(135deg,#0b0c0f_0%,#101116_48%,#09090b_100%)] px-5 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.03)_32%,transparent_64%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isEligible ? "accent" : "neutral"} dot>
                Collaboration Arena
              </Badge>
              <Badge tone="neutral">{stats.institution.code}</Badge>
              <Badge tone="success">{profile.isPremium ? "Premium active" : "Upgrade to unlock"}</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {getCollaborationHeadline(!isEligible)}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
                StudyBond collaboration rooms feel deliberate before the first
                question appears: shared subjects, the same question source, a
                real invite code, and a room flow that keeps both players in one
                cinematic rhythm.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {statChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.label}
                    className="inline-flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/70">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        {chip.label}
                      </p>
                      <p className="text-sm font-medium text-white/80">
                        {chip.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Surface className="bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-white/70">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-medium">Shared question set</span>
              </div>
              <p className="text-sm leading-relaxed text-white/45">
                Both players get the same paper, the same clock, and the same
                chance to prove composure.
              </p>
            </Surface>

            <Surface className="bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-white/70">
                <Radio className="h-4 w-4 text-sky-300" />
                <span className="text-sm font-medium">Live lobby heartbeat</span>
              </div>
              <p className="text-sm leading-relaxed text-white/45">
                Invite code, player presence, host controls, and launch handoff
                are all synced in one room.
              </p>
            </Surface>

            <Surface className="bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-white/70">
                <Swords className="h-4 w-4 text-[var(--sb-accent)]" />
                <span className="text-sm font-medium">Competitive elegance</span>
              </div>
              <p className="text-sm leading-relaxed text-white/45">
                This is built for students who want beauty, pressure, and focus
                in the same session.
              </p>
            </Surface>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Create a Room
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Set the mood before the matchup starts.
            </h2>
          </div>

          <Surface tone={formTone} className="overflow-hidden">
            <div className="border-b border-white/[0.05] bg-white/[0.02] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    {sourceMeta.label}
                  </p>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/45">
                    {sourceMeta.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_0_24px_rgba(224,144,64,0.12)]",
                    sourceMeta.accentClass,
                  )}
                >
                  <SourceIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-6">
              <div className="grid gap-3 md:grid-cols-3">
                {collaborationQuestionSources.map((source) => {
                  const Icon = source.icon;
                  const isActive = questionSource === source.value;

                  return (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => {
                        setQuestionSource(source.value);
                        setFormError(null);
                        if (source.value === "MIXED" && selectedSubjects.length > 3) {
                          setSelectedSubjects((current) => current.slice(0, 3));
                        }
                      }}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-left transition-all duration-300",
                        isActive
                          ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/10 shadow-[0_0_16px_var(--sb-accent-glow)]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]",
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                          {source.eyebrow}
                        </span>
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-[var(--sb-accent)]" : "text-white/35",
                          )}
                        />
                      </div>
                      <p className="text-sm font-medium text-white/85">
                        {source.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/40">
                        {source.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-5 md:gap-6 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/75">
                        Subject stack
                      </p>
                      <p className="mt-1 text-sm text-white/40">
                        {playlistLine}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 gap-1.5">
                      {Array.from({ length: maxSubjects }).map((_, index) => (
                        <span
                          key={index}
                          className={cn(
                            "h-2 w-8 rounded-full transition-all duration-300",
                            index < seatsFilled
                              ? "bg-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]"
                              : "bg-white/[0.06]",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                    {collaborationSubjects.map((subject) => {
                      const Icon = subject.icon;
                      const isSelected = selectedSubjects.includes(subject.value);

                      return (
                        <button
                          key={subject.value}
                          type="button"
                          onClick={() => toggleSubject(subject.value)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300",
                            isSelected
                              ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/10 shadow-[0_0_14px_var(--sb-accent-glow)]"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-2xl",
                              isSelected
                                ? "bg-[var(--sb-accent)]/18 text-white"
                                : "bg-white/[0.05]",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                isSelected ? "text-white" : subject.colorClass,
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white/85">
                              {subject.label}
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                              {isSelected ? "In the duel mix" : "Tap to include"}
                            </p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-[var(--sb-accent)]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <Field
                    label="Room Name"
                    placeholder="Eg. Saturday Physics face-off"
                    maxLength={60}
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                  />

                  <Surface className="rounded-[24px] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Live Preview
                      </p>
                      <Badge tone="accent">2 seats</Badge>
                    </div>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {customName.trim() || "Untitled collaboration room"}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/42">
                      {sourceMeta.label} with {selectedSubjects.length} selected
                      {selectedSubjects.length === 1 ? " subject" : " subjects"}.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {selectedSubjects.map((subject) => (
                        <Badge key={subject} tone="neutral">
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
                          Host
                        </p>
                        <p className="mt-1 text-sm font-medium text-white/75">
                          {profile.fullName}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
                          Challenger
                        </p>
                        <p className="mt-1 text-sm font-medium text-white/40">
                          Awaiting invite
                        </p>
                      </div>
                    </div>
                  </Surface>
                </div>
              </div>

              {formError ? <InlineError message={formError} /> : null}

              <div className="flex flex-col gap-3 border-t border-white/[0.05] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">
                    Collaboration unlock rules
                  </p>
                  <p className="mt-1 text-sm text-white/40">
                    Premium plus two completed real exams keeps the room honest
                    and competitive.
                  </p>
                </div>
                {isPremiumLocked ? (
                  <Button asChild size="lg" href={"/dashboard/settings" as Route}>
                    <>
                      Upgrade to open rooms
                      <Crown className="h-4 w-4" />
                    </>
                  </Button>
                ) : needsMoreRealExams ? (
                  <Button asChild size="lg" href={"/dashboard/practice" as Route}>
                    <>
                      Finish your unlock exams
                      <ArrowRight className="h-4 w-4" />
                    </>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleCreateRoom}
                    isLoading={createMutation.isPending}
                  >
                    Open collaboration room
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Surface>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Join Fast
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Walk straight into a live room with a code.
            </h2>
          </div>

          <Surface className="overflow-hidden">
            <div className="border-b border-white/[0.05] bg-white/[0.02] px-5 py-5 sm:px-6">
              <p className="text-sm font-medium text-white/80">
                Paste a room code
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/40">
                Shareable, human-readable, and built for quick phone-to-phone
                invites after class.
              </p>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <Field
                label="Room Code"
                placeholder="SB-DUEL-1A2B"
                value={joinCode}
                onChange={(event) => setJoinCode(sanitizeCode(event.target.value))}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handlePasteCode}
                >
                  <Clipboard className="h-4 w-4" />
                  Paste code
                </Button>
                <Button
                  size="lg"
                  onClick={handleJoinRoom}
                  isLoading={joinMutation.isPending}
                  disabled={!isEligible}
                >
                  Join room
                  <DoorOpen className="h-4 w-4" />
                </Button>
              </div>

              {!isEligible ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-sm text-white/45">
                  {isPremiumLocked ? (
                    <span>
                      Collaboration rooms are premium-only for now. Upgrade and
                      this join path opens instantly.
                    </span>
                  ) : (
                    <span>
                      Finish {Math.max(0, 2 - stats.realExamsCompleted)} more real
                      exam{stats.realExamsCompleted === 1 ? "" : "s"} to join a
                      duel room.
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </Surface>

          <Surface className="px-5 py-5 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Recent rooms</p>
                <p className="mt-1 text-sm text-white/40">
                  Jump back into lobbies you touched recently.
                </p>
              </div>
            </div>

            {recentRooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-white/30">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-semibold text-white/82">
                  No recent rooms yet
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/42">
                  Once you create or join a collaboration room, it will stay
                  here for quick re-entry.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRooms.map((room) => (
                  <Link
                    key={room.code}
                    href={`/dashboard/collaboration/${room.code}` as Route}
                    className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/82">
                          {room.effectiveDisplayName}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {room.code} • {room.questionSource.replaceAll("_", " ")}
                        </p>
                      </div>
                      <Badge
                        tone={
                          room.status === "COMPLETED"
                            ? "success"
                            : room.status === "CANCELLED"
                              ? "danger"
                              : "accent"
                        }
                      >
                        {room.status.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {room.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/45"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Surface>
        </div>
      </section>
    </div>
  );
}
