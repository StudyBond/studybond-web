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
  Dices,
  DoorOpen,
  Lock,
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
  getCollaborationStatChips,
  getQuestionSourceMeta,
} from "@/features/collaboration/lib/collaboration-config";
import { generateDuelName } from "@/features/collaboration/lib/duel-name-generator";
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
      let message = "Could not create the room. Please try again.";
      if (error instanceof Error) {
        // Map technical backend messages to user-friendly text
        const raw = error.message.toLowerCase();
        if (raw.includes("name") || raw.includes("custom")) {
          message = "Room name is invalid. Try a shorter name or use the auto-generate button.";
        } else if (raw.includes("premium")) {
          message = "Duel rooms are a premium feature. Upgrade to unlock.";
        } else if (raw.includes("subject")) {
          message = "Please check your subject selection and try again.";
        } else if (raw.includes("limit") || raw.includes("rate")) {
          message = "You're creating rooms too fast. Wait a moment and try again.";
        } else {
          message = error.message;
        }
      }
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
      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(224,144,64,0.14),transparent_30%),linear-gradient(135deg,#0b0c0f_0%,#0d0a08_48%,#09090b_100%)] px-5 py-8 sm:px-8 sm:py-10">
        {/* Animated ambient layer */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.02)_32%,transparent_64%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-500/[0.04] blur-[100px] pointer-events-none sb-duel-anticipation-pulse" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isEligible ? "accent" : "neutral"} dot>
                1v1 Duel Arena
              </Badge>
              <Badge tone="neutral">{stats.institution.code}</Badge>
              <Badge tone="success">{profile.isPremium ? "Premium active" : "Upgrade to unlock"}</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                {isEligible
                  ? "Enter the Arena."
                  : "Earn your right to fight."}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
                Challenge a friend to a head-to-head duel. Same paper, same clock, same pressure — only one walks away with the crown. Build a room, share the code, and let the exam decide who&apos;s built different.
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

          {/* Duel visual — VS arena card */}
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-[340px] rounded-[28px] border border-white/[0.06] bg-[#0c0c0f]/70 backdrop-blur-xl p-6 shadow-2xl">
              {/* VS badge */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-[0_0_30px_rgba(239,68,68,0.25)] border-4 border-[#0c0c0f]">
                    <Swords className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Fighter slots */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-lg font-bold text-white">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-white/80 truncate">{profile.fullName.split(" ")[0]}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/50 mt-0.5">You</p>
                </div>
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-lg text-white/20">
                    ?
                  </div>
                  <p className="text-xs font-medium text-white/30">Awaiting</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-red-400/30 mt-0.5">Rival</p>
                </div>
              </div>

              {/* Duel stats footer */}
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-white/25">
                <span>Same paper</span>
                <span>•</span>
                <span>Same timer</span>
                <span>•</span>
                <span>One winner</span>
              </div>
            </div>
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
              Forge your arena before the battle begins.
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
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-white/70">Room Name <span className="text-white/30 font-normal">(optional)</span></label>
                      <button
                        type="button"
                        onClick={() => setCustomName(generateDuelName(selectedSubjects))}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-amber-400/70 hover:text-amber-400 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-500/10 hover:border-amber-500/20 transition-all duration-200 active:scale-95"
                      >
                        <Dices className="h-3 w-3" />
                        Generate name
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Eg. Saturday Physics face-off"
                      maxLength={60}
                      value={customName}
                      onChange={(event) => setCustomName(event.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white/90 outline-none transition-all duration-200 placeholder:text-white/20 hover:border-white/[0.1] focus:border-[#e09040]/50 focus:ring-2 focus:ring-[#e09040]/15 focus:bg-white/[0.05]"
                    />
                  </div>

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
                  <Button asChild size="lg" href={"/dashboard/settings?tab=subscription" as Route}>
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
              Join a Duel
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Step into a live arena with a code.
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
