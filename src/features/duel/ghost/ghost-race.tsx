"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DuelScreen } from "@/features/duel/components/duel-screen";
import { useGhostOptions, useStartGhost } from "@/features/duel/hooks/use-duel-play";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { GhostLevel } from "@/lib/api/duel";
import type { UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { BigSubjectPicker, useNeedsBigPicker } from "../setup/big-subject-picker";
import s from "../ui/duel.module.css";
import { BackIcon } from "../ui/icons";
import { SubjectTile, apiErrorCode, apiErrorMessage } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import g from "./ghost.module.css";

export function ghostStoreKey(examId: number) {
  return `sb-ghost-${examId}`;
}

export type StoredGhost = { timeline: number[]; startedAt: string; label: string };

export function GhostRacePage() {
  return <DuelScreen errorText="Could not load Race a ghost.">{({ profile }) => <GhostRace profile={profile} />}</DuelScreen>;
}

/** Race a ghost (mockup 12b): pick a subject and a ghost level, then race. */
function GhostRace({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const { data: examProfile } = useExamProfile();
  const subjects = examProfile?.subjects ?? [];
  const bigBoard = useNeedsBigPicker(subjects);
  const [subject, setSubject] = useState<string | null>(null);
  const chosen = subject ?? (bigBoard ? null : subjects[0]?.name ?? null);
  const [level, setLevel] = useState<GhostLevel>("STRONG");
  const options = useGhostOptions(chosen);
  const start = useStartGhost();
  const data = options.data;

  const isPremium = data?.isPremium ?? profile.isPremium;
  const useText = !data
    ? ""
    : !data.isPremium
      ? data.freeDuelAvailable === false
        ? "Free duel used this week"
        : "Uses your free duel"
      : `${data.racesLeftToday ?? 0} of ${data.racesPerDay ?? 3} left today`;
  const blocked = Boolean(data && ((!data.isPremium && data.freeDuelAvailable === false) || (data.isPremium && data.racesLeftToday === 0)));

  async function go() {
    if (!chosen) return;
    playDuelSound("go");
    try {
      const race = await start.mutateAsync({ subject: chosen, level });
      const picked = data?.levels.find((option) => option.level === level);
      try {
        window.sessionStorage.setItem(
          ghostStoreKey(race.examId),
          JSON.stringify({ timeline: race.ghostTimeline, startedAt: race.startedAt, label: picked?.label ?? race.levelLabel } satisfies StoredGhost),
        );
      } catch {
        // No storage: the race runs without the ghost's lane.
      }
      router.push(`/exams/${race.examId}?ghost=1` as Route);
    } catch (error) {
      const code = apiErrorCode(error);
      if (code === "DUEL_GHOST_IN_PROGRESS") {
        const examId = (error as { payload?: { error?: { details?: { examId?: number } } } }).payload?.error?.details?.examId;
        if (examId) {
          router.push(`/exams/${examId}?ghost=1` as Route);
          return;
        }
      }
      toast.error(apiErrorMessage(error, "Could not start the race."));
    }
  }

  return (
    <div className={cn("sb-ui", s.page)}>
      <header className={s.top}>
        <Link className={s.iconBtn} href={"/dashboard/duel" as Route} aria-label="Back to Duel">
          <BackIcon />
        </Link>
        <h1 className={s.topTitle}>Race a ghost</h1>
      </header>

      <div className={g.scroll}>
        <section className={g.intro}>
          <GhostFace size={52} />
          <div>
            <b>What&apos;s a ghost?</b>
            <p>
              For each question, the ghost uses an answer a real StudyBond student already gave, and the time they took. So it races
              like a live duel, on any questions. No names, no faces.
            </p>
          </div>
        </section>

        <h2 className={g.h}>Pick one subject</h2>
        {bigBoard ? (
          <BigSubjectPicker
            subjects={subjects}
            picked={chosen ? [chosen] : []}
            max={1}
            department={profile.department ?? null}
            taster
            onToggle={(name) => setSubject(name)}
            nudge={null}
          />
        ) : (
          <div className={g.slist} role="radiogroup" aria-label="Subject">
            {subjects.map((item) => (
              <button
                key={item.name}
                type="button"
                className={cn(g.srow, chosen === item.name && g.on)}
                role="radio"
                aria-checked={chosen === item.name}
                onClick={() => {
                  playDuelSound("tap");
                  setSubject(item.name);
                }}
              >
                <SubjectTile iconName={item.iconName} code={item.code} colorToken={item.colorToken} size={36} />
                <b>{item.name}</b>
                <span className={g.radio} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        <h2 className={g.h}>Pick your ghost</h2>
        <div className={g.levels} role="radiogroup" aria-label="Ghost">
          {(data?.levels ?? []).map((option, index) => (
            <button
              key={option.level}
              type="button"
              className={cn(g.lvl, level === option.level && g.on)}
              role="radio"
              aria-checked={level === option.level}
              onClick={() => {
                playDuelSound("tap");
                setLevel(option.level);
              }}
            >
              <GhostFace size={40} delay={index * 0.4} />
              <span>
                <b>{option.label}</b>
                <small>{option.who}</small>
              </span>
              <span className={g.sc}>
                <b>{option.expectedScore}/{data?.totalQuestions}</b>
                <small>{option.secondsPerQuestion}s a question</small>
              </span>
            </button>
          ))}
          {options.isLoading && chosen && <p className={g.note}>Finding ghosts for {chosen}…</p>}
          {!chosen && <p className={g.note}>Pick a subject to see its ghosts.</p>}
        </div>
        <p className={g.note}>
          {isPremium
            ? "Ghost races pay normal SP, not the duel rate, and don't count towards rivals or your duel record."
            : `Taster ghosts race on the same ${data?.totalQuestions ?? 15} questions you get, from a fixed set of about 40 per subject.`}{" "}
          Where students have answered a question, the ghost replays one of their real answers and times.
        </p>
      </div>

      <div className={cn(g.foot, g.stickyBar)}>
        <p>
          <span>
            {chosen ?? "No subject"} · <b>{data?.totalQuestions ?? "–"} questions</b>
            {data ? ` · ${Math.round(data.durationSeconds / 60)} min` : ""}
          </span>
          <span className={cn(g.use, data?.isPremium && g.left)}>{useText}</span>
        </p>
        <button type="button" className={cn(s.btn, s.ink, s.wide)} disabled={!chosen || !data || blocked || start.isPending} onClick={go}>
          {start.isPending ? "Starting…" : "Start the race"}
        </button>
      </div>
    </div>
  );
}

/** A ghost: a faded, dashed-ring silhouette. No names, no faces. */
export function GhostFace({ size, delay = 0 }: { size: number; delay?: number }) {
  return (
    <span className={g.ghost} style={{ animationDelay: `${delay}s` }}>
      <span className={g.fade}>
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="#2a2a30" />
          <circle cx="12" cy="9.5" r="4" fill="rgba(255,255,255,0.32)" />
          <path d="M4.5 21c1-4 3.9-6.3 7.5-6.3s6.5 2.3 7.5 6.3Z" fill="rgba(255,255,255,0.32)" />
        </svg>
      </span>
    </span>
  );
}
