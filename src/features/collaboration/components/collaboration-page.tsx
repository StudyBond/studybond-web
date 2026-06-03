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

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-10 pb-8">

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ HERO BANNER                               ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="sb-enter sb-arena-hero">
        {/* Floating background lights */}
        <div className="sb-arena-hero__light sb-arena-hero__light--crimson" />
        <div className="sb-arena-hero__light sb-arena-hero__light--violet" />
        <div className="sb-arena-hero__light sb-arena-hero__light--amber" />
        
        {/* Ambient grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.015)_30%,transparent_60%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isEligible ? "accent" : "neutral"} dot>
                1v1 Duel Arena
              </Badge>
              <Badge tone="neutral">{stats.institution.code}</Badge>
              <Badge tone="success">{profile.isPremium ? "Premium active" : "Upgrade to unlock"}</Badge>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3.5xl font-extrabold tracking-tight text-white sm:text-5xl font-display">
                {isEligible
                  ? "Enter the Arena."
                  : "Earn your right to fight."}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
                Challenge a friend to a head-to-head duel. Same paper, same clock, same pressure — only one walks away with the crown.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {statChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.label}
                    className="inline-flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 backdrop-blur-md"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white/70">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                        {chip.label}
                      </p>
                      <p className="text-sm font-semibold text-white/80">
                        {chip.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: VS arena card */}
          <div className="relative flex items-center justify-center">
            <div className="sb-arena-vs-card">
              {/* VS badge */}
              <div className="sb-arena-vs-card__ring-container">
                <div className="sb-arena-vs-card__ring-glow" />
                <div className="sb-arena-vs-card__ring">
                  <Swords className="h-5 w-5 text-red-400" />
                </div>
              </div>

              {/* Fighter slots */}
              <div className="grid grid-cols-2 gap-3">
                <div className="sb-arena-fighter sb-arena-fighter--you">
                  <div className="sb-arena-avatar sb-arena-avatar--you">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-white/90 truncate">{profile.fullName.split(" ")[0]}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500/60 mt-0.5">You</p>
                </div>
                <div className="sb-arena-fighter sb-arena-fighter--rival">
                  <div className="sb-arena-avatar sb-arena-avatar--rival">
                    ?
                  </div>
                  <p className="text-xs font-semibold text-white/40">Awaiting</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mt-0.5">Rival</p>
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


      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ CREATE ROOM                               ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="sb-enter" style={{ animationDelay: "150ms" }}>
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-2">
            Create a Room
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Forge your arena before the battle begins.
          </h2>
        </div>

        <Surface tone={formTone} className="overflow-hidden bg-[#0d0e12]/30 backdrop-blur-md">
          <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">

            {/* ─── Question Source Selector ─── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white/80">Question Source</p>
                  <p className="mt-1 text-[13px] text-white/40">
                    Choose the type of questions for your duel.
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[0_0_20px_rgba(224,144,64,0.10)]",
                    sourceMeta.accentClass,
                  )}
                >
                  <SourceIcon className="h-4 w-4" />
                </div>
              </div>

              <div className="sb-arena-mode-grid">
                {collaborationQuestionSources.map((source) => {
                  const Icon = source.icon;
                  const isActive = questionSource === source.value;
                  const accentColor = source.value === "REAL_PAST_QUESTION" ? "#d4a121" : source.value === "PRACTICE" ? "#60a5fa" : "#f43f5e";
                  const glowColor = source.value === "REAL_PAST_QUESTION" ? "rgba(212, 161, 33, 0.15)" : source.value === "PRACTICE" ? "rgba(96, 165, 250, 0.12)" : "rgba(244, 63, 94, 0.12)";

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
                        "sb-arena-mode-card",
                        isActive && "sb-arena-mode-card--active",
                      )}
                      style={{
                        "--mode-accent": accentColor,
                        "--mode-glow": glowColor,
                      } as React.CSSProperties}
                    >
                      <div className="sb-arena-mode-card__glow" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">
                            {source.eyebrow}
                          </span>
                          <Icon className={cn("h-4 w-4", isActive ? "text-[var(--mode-accent)]" : "text-white/20")} style={{ color: isActive ? accentColor : undefined }} />
                        </div>
                        <h4 className="text-[14px] font-bold text-white/90 mb-1">{source.label}</h4>
                        <p className="text-[12px] text-white/40 leading-relaxed">{source.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Subject Selection ─── */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-white/80">Lobby Loadout</p>
                  <p className="mt-1 text-[13px] text-white/40 max-w-md">
                    {playlistLine}
                  </p>
                </div>
                
                {/* Visual Loadout tracker slots */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Slots:</span>
                  <div className="sb-arena-loadout-tracker">
                    {Array.from({ length: maxSubjects }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "sb-arena-loadout-tracker__slot",
                          index < seatsFilled && "sb-arena-loadout-tracker__slot--filled",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="sb-arena-loadout-grid">
                {collaborationSubjects.map((subject) => {
                  const Icon = subject.icon;
                  const isSelected = selectedSubjects.includes(subject.value);
                  const subjectColor = 
                    subject.value === "English" ? "#fb7185" : 
                    subject.value === "Mathematics" ? "#38bdf8" : 
                    subject.value === "Physics" ? "#a78bfa" : 
                    subject.value === "Chemistry" ? "#34d399" : 
                    "#a3e635";
                  const subjectGlow = 
                    subject.value === "English" ? "rgba(251, 113, 133, 0.15)" :
                    subject.value === "Mathematics" ? "rgba(56, 189, 248, 0.15)" :
                    subject.value === "Physics" ? "rgba(167, 139, 250, 0.15)" :
                    subject.value === "Chemistry" ? "rgba(52, 211, 153, 0.15)" :
                    "rgba(163, 230, 53, 0.15)";

                  return (
                    <button
                      key={subject.value}
                      type="button"
                      onClick={() => toggleSubject(subject.value)}
                      className={cn(
                        "sb-arena-loadout-item",
                        isSelected && "sb-arena-loadout-item--selected",
                      )}
                      style={{
                        "--subject-color": subjectColor,
                        "--subject-glow": subjectGlow,
                      } as React.CSSProperties}
                    >
                      {isSelected && (
                        <div className="sb-arena-loadout-check">
                          <CheckCircle2 className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                      <div className="sb-arena-loadout-item__icon-container">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="sb-arena-loadout-item__label">{subject.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Room Settings + Match Ticket Summary ─── */}
            <div className="grid gap-6 lg:grid-cols-2 items-end">
              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-white/70">
                      Lobby Title <span className="text-white/30 font-normal text-xs">(optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomName(generateDuelName(selectedSubjects))}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-500/10 hover:border-amber-500/20 transition-all duration-200 active:scale-95"
                    >
                      <Dices className="h-3 w-3" />
                      Roll Name
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Eg. Physics face-off"
                    maxLength={60}
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-[#0c0d11]/70 px-4 py-3 text-sm text-white/90 outline-none transition-all duration-200 placeholder:text-white/20 hover:border-white/[0.1] focus:border-[#e09040]/50 focus:ring-2 focus:ring-[#e09040]/15"
                  />
                </div>
              </div>

              {/* Match Ticket */}
              <div className="sb-arena-ticket">
                <div className="sb-arena-ticket__scanlines" />
                <div className="sb-arena-ticket__section">
                  <div className="sb-arena-ticket__icon">
                    <SourceIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Lobby Title</span>
                    <strong className="text-sm font-bold text-white/90 truncate max-w-[200px]">
                      {customName.trim() || "Untitled Lobby"}
                    </strong>
                  </div>
                </div>

                <div className="sb-arena-ticket__divider" />

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Protocol</span>
                  <span className="text-xs font-semibold text-white/70 mt-0.5">{sourceMeta.label}</span>
                </div>

                <div className="sb-arena-ticket__divider" />

                <div className="sb-arena-ticket__code-strip">
                  <div className="flex flex-col align-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Deck</span>
                    <span className="text-xs font-semibold text-white/70 mt-0.5 truncate max-w-[120px]">
                      {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "No subjects select"}
                    </span>
                  </div>
                  <div className="sb-arena-ticket__barcode" />
                </div>
              </div>
            </div>

            {/* ─── Error ─── */}
            {formError ? <InlineError message={formError} /> : null}

            {/* ─── CTA ─── */}
            <div className="flex flex-col gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/70">
                  Lobby Admission Protocol
                </p>
                <p className="mt-1 text-[13px] text-white/40">
                  Room access requires a premium credential and at least two official exam completions.
                </p>
              </div>
              <div className="shrink-0">
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

          </div>
        </Surface>
      </section>


      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ JOIN + RECENT ROOMS                       ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="sb-enter grid gap-6 lg:grid-cols-2" style={{ animationDelay: "250ms" }}>

        {/* ─── Join a Duel ─── */}
        <div>
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-2">
              Join a Duel
            </p>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Step into a live arena with a code.
            </h2>
          </div>

          <Surface className="px-5 py-5 sm:px-6 space-y-5 bg-[#0d0e12]/30 backdrop-blur-md">
            <div>
              <p className="text-sm font-semibold text-white/80 mb-1">
                Room Code
              </p>
              <p className="text-[13px] text-white/40 mb-4">
                Paste a shareable code to jump into a friend&apos;s room instantly.
              </p>

              <div className="sb-collab-join-input">
                <input
                  type="text"
                  placeholder="SB-DUEL-1A2B"
                  value={joinCode}
                  onChange={(event) => setJoinCode(sanitizeCode(event.target.value))}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#0c0d11]/70 px-4 py-3 text-sm text-white/90 outline-none transition-all duration-200 placeholder:text-white/20 hover:border-white/[0.1] focus:border-[#e09040]/50 focus:ring-2 focus:ring-[#e09040]/15 font-mono tracking-wider"
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handlePasteCode}
                  className="shrink-0"
                >
                  <Clipboard className="h-4 w-4" />
                  Paste
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleJoinRoom}
              isLoading={joinMutation.isPending}
              disabled={!isEligible}
              className="w-full"
            >
              Join room
              <DoorOpen className="h-4 w-4" />
            </Button>

            {!isEligible ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] text-white/45 leading-relaxed">
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
          </Surface>
        </div>

        {/* ─── Recent Rooms ─── */}
        <div>
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-2">
              Recent Rooms
            </p>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Jump back into a lobby.
            </h2>
          </div>

          {recentRooms.length === 0 ? (
            <Surface className="px-5 py-10 text-center bg-[#0d0e12]/30 backdrop-blur-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-white/30 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <p className="text-base font-semibold text-white/80">
                No recent rooms yet
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/42">
                Once you create or join a collaboration room, it will appear here for quick re-entry.
              </p>
            </Surface>
          ) : (
            <div className="space-y-3">
              {recentRooms.map((room) => {
                const roomColor = 
                  room.questionSource === "REAL_PAST_QUESTION" ? "#d4a121" : 
                  room.questionSource === "PRACTICE" ? "#60a5fa" : 
                  "#f43f5e";

                return (
                  <Link
                    key={room.code}
                    href={`/dashboard/collaboration/${room.code}` as Route}
                    className="sb-arena-room-card"
                    style={{
                      "--room-color": roomColor,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-4 pr-6">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white/85">
                          {room.effectiveDisplayName}
                        </p>
                        <p className="mt-1 text-xs text-white/35 font-medium tracking-wide">
                          {room.code} • {room.questionSource.replaceAll("_", " ")}
                        </p>
                      </div>
                      
                      <div className="sb-arena-room-card__header-right">
                        <Badge
                          tone={
                            room.status === "COMPLETED"
                              ? "success"
                              : room.status === "CANCELLED"
                                ? "danger"
                                : "accent"
                          }
                        >
                          {room.status === "WAITING" && (
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#e09040] animate-pulse" />
                          )}
                          {room.status.replaceAll("_", " ")}
                        </Badge>
                      </div>

                      <div className="sb-arena-room-card__arrow">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {room.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40 border border-white/[0.02]"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
