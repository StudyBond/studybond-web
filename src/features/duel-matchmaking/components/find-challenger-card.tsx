"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Crown, Loader2, Search, Shuffle, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/inline-error";
import { Surface } from "@/components/ui/surface";
import { SubjectIcon, subjectPalette } from "@/components/ui/subject-icon";
import {
  useCancelDuelSearchMutation,
  useDuelMatchmaking,
  useFindChallengerMutation,
} from "@/features/duel-matchmaking/hooks/use-duel-matchmaking";
import {
  KEEP_LOOKING_PROMPT_SECONDS,
  describeSubjects,
  formatElapsed,
  secondsSince,
} from "@/features/duel-matchmaking/lib/matchmaking-store";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { DuelMatchmakingView } from "@/lib/api/duel-matchmaking";
import type { UserStats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type FindChallengerCardProps = {
  stats: UserStats;
};

function studentsLine(count: number) {
  return `${count} student${count === 1 ? "" : "s"}`;
}

/**
 * "Find a challenger" on the Duel page: pick subjects, search, and watch the
 * search run. The popup and the bar that follow the student around the app
 * live in DuelSearchDock.
 */
export function FindChallengerCard({ stats }: FindChallengerCardProps) {
  const isPremiumLocked = !stats.isPremium;
  const needsMoreRealExams = stats.isPremium && stats.realExamsCompleted < 2;
  const isEligible = !isPremiumLocked && !needsMoreRealExams;

  const { data: view, isLoading } = useDuelMatchmaking({ refreshWhileIdle: isEligible });

  return (
    <section className="sb-enter" style={{ animationDelay: "100ms" }}>
      <div className="mb-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25">
          Find a Challenger
        </p>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          No friend online? Find someone who is.
        </h2>
      </div>

      <Surface tone={isEligible ? "accent" : "default"} className="overflow-hidden bg-[#0d0e12]/30 backdrop-blur-md">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {!isEligible ? (
            <LockedPanel
              isPremiumLocked={isPremiumLocked}
              examsLeft={Math.max(0, 2 - stats.realExamsCompleted)}
              lookingNow={view?.lookingNow ?? 0}
            />
          ) : isLoading || !view ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-400/60" />
            </div>
          ) : view.state === "SEARCHING" ? (
            <SearchingPanel view={view} />
          ) : view.state === "MATCHED" || view.state === "STARTING" ? (
            <StatusPanel
              title="Challenger found!"
              body={`${view.match?.opponentFirstName ?? "Someone"} wants a ${view.match?.subject ?? ""} duel. Tap Ready in the popup.`}
            />
          ) : view.state === "STARTED" ? (
            <StatusPanel title="Duel on!" body="Opening your paper now." />
          ) : (
            <SubjectPicker view={view} mode="start" />
          )}
        </div>
      </Surface>
    </section>
  );
}

function LockedPanel({
  isPremiumLocked,
  examsLeft,
  lookingNow,
}: {
  isPremiumLocked: boolean;
  examsLeft: number;
  lookingNow: number;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/80">
          {isPremiumLocked
            ? "Finding a challenger is part of premium."
            : `Finish ${examsLeft} more real exam${examsLeft === 1 ? "" : "s"} to unlock duels.`}
        </p>
        <p className="mt-1 text-[13px] text-white/40">
          {lookingNow > 0
            ? `${studentsLine(lookingNow)} looking for a duel right now.`
            : "We pair you with a student on your exam who is online right now."}
        </p>
      </div>
      <div className="shrink-0">
        {isPremiumLocked ? (
          <Button asChild size="lg" href={"/dashboard/settings?tab=subscription" as Route}>
            <>
              Upgrade to duel
              <Crown className="h-4 w-4" />
            </>
          </Button>
        ) : (
          <Button asChild size="lg" href={"/dashboard/practice" as Route}>
            <>
              Finish your unlock exams
              <ArrowRight className="h-4 w-4" />
            </>
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
        <Swords className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold text-white">{title}</p>
        <p className="mt-0.5 text-[13px] text-white/45">{body}</p>
      </div>
    </div>
  );
}

/**
 * Subject chips plus the search button. Used to start a search, and again to
 * change subjects mid-search, which keeps the student's place in line.
 */
function SubjectPicker({
  view,
  mode,
  onDone,
}: {
  view: DuelMatchmakingView;
  mode: "start" | "update";
  onDone?: () => void;
}) {
  const { data: examProfile, isLoading: subjectsLoading } = useExamProfile();
  const searchMutation = useFindChallengerMutation();
  const subjects = examProfile?.subjects ?? [];

  // Start from the student's last choice, or "Any subject".
  const [anySubject, setAnySubject] = useState(view.anySubject || view.subjects.length === 0);
  const [picked, setPicked] = useState<string[]>(view.anySubject ? [] : view.subjects);
  const [error, setError] = useState<string | null>(null);

  function toggle(name: string) {
    setError(null);
    if (anySubject) {
      setAnySubject(false);
      setPicked([name]);
      return;
    }
    const next = picked.includes(name) ? picked.filter((item) => item !== name) : [...picked, name];
    if (next.length === 0) setAnySubject(true);
    setPicked(next);
  }

  function chooseAny() {
    setError(null);
    setAnySubject(true);
    setPicked([]);
  }

  async function handleSearch() {
    setError(null);
    if (!anySubject && picked.length === 0) {
      setError("Pick at least one subject, or choose Any subject.");
      return;
    }
    try {
      await searchMutation.mutateAsync({ subjects: anySubject ? [] : picked, anySubject });
      onDone?.();
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Could not start the search.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-white/80">Which subjects are you happy to duel in?</p>
        <p className="mt-1 text-[13px] text-white/40">
          Tick as many as you like. More subjects means a faster match. The duel is one subject you both picked.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={chooseAny}
          aria-pressed={anySubject}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition",
            anySubject
              ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
              : "border-white/[0.06] bg-white/[0.02] text-white/55 hover:border-white/[0.12] hover:text-white/80",
          )}
        >
          <Shuffle className="h-3.5 w-3.5" />
          Any subject
        </button>

        {subjectsLoading &&
          [0, 1, 2, 3].map((index) => (
            <div key={index} className="h-[38px] w-28 animate-pulse rounded-xl bg-white/[0.03]" />
          ))}

        {subjects.map((subject) => {
          const selected = !anySubject && picked.includes(subject.name);
          const palette = subjectPalette(subject.colorToken);
          return (
            <button
              key={subject.name}
              type="button"
              onClick={() => toggle(subject.name)}
              aria-pressed={selected}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition",
                selected
                  ? "text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-white/55 hover:border-white/[0.12] hover:text-white/80",
              )}
              style={
                selected
                  ? { borderColor: `${palette.hex}80`, backgroundColor: `${palette.hex}1a` }
                  : undefined
              }
            >
              <SubjectIcon iconName={subject.iconName} code={subject.code} size={14} />
              {subject.name}
            </button>
          );
        })}
      </div>

      {error ? <InlineError message={error} /> : null}

      <div className="flex flex-col gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-white/40">
          {view.lookingNow > 0 ? (
            <>
              <span className="font-semibold text-amber-300">{studentsLine(view.lookingNow)}</span> looking for a
              duel right now.
            </>
          ) : (
            "You'll only be matched with someone who is online right now."
          )}
        </p>
        <div className="flex shrink-0 gap-3">
          {mode === "update" && (
            <Button variant="ghost" size="lg" onClick={onDone} disabled={searchMutation.isPending}>
              Keep current
            </Button>
          )}
          <Button size="lg" onClick={handleSearch} isLoading={searchMutation.isPending}>
            {mode === "start" ? "Find a challenger" : "Update search"}
            <Swords className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function useTicker() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function SearchingPanel({ view }: { view: DuelMatchmakingView }) {
  const router = useRouter();
  const now = useTicker();
  const cancelMutation = useCancelDuelSearchMutation();
  const [editing, setEditing] = useState(false);

  // The prompt counts from when this screen opened, not from when the search
  // began, so someone coming back to the page is not nagged straight away.
  const [openedAt] = useState(() => Date.now());
  const onScreenSeconds = Math.floor((now - openedAt) / 1000);
  const elapsed = formatElapsed(secondsSince(view.searchingSince, now));

  if (editing) {
    return <SubjectPicker view={view} mode="update" onDone={() => setEditing(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          {!view.paused && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/15" />
              <span className="absolute inset-2 animate-pulse rounded-full bg-amber-400/10" />
            </>
          )}
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-[#121318] text-amber-300">
            <Search className="h-5 w-5" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-white">
            {view.paused ? "Search paused during your exam" : "Looking for a challenger…"}
          </p>
          <p className="mt-0.5 text-[13px] text-white/45">
            <span className="font-semibold tabular-nums text-white/70">{elapsed}</span>
            {" · "}
            {describeSubjects(view)}
          </p>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-white/45">
        {view.paused
          ? "We'll carry on looking as soon as you finish."
          : view.lookingNow > 0
            ? `${studentsLine(view.lookingNow)} looking right now, in other subjects. Tick more subjects to match faster.`
            : "Nobody else is searching right now. Stay on StudyBond and we'll pop up the moment someone is."}
      </p>

      {onScreenSeconds >= KEEP_LOOKING_PROMPT_SECONDS && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-100">No one yet. You don&apos;t have to wait here.</p>
            <p className="mt-0.5 text-[12px] text-amber-100/50">
              Practise or read. A bar stays at the bottom of the screen, and we&apos;ll pop up when someone&apos;s found.
            </p>
          </div>
          <Button size="md" onClick={() => router.push("/dashboard" as Route)} className="shrink-0">
            Keep looking while I study
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-white/[0.05] pt-6">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Change subjects
        </Button>
        <Button variant="ghost" onClick={() => cancelMutation.mutate()} isLoading={cancelMutation.isPending}>
          Stop searching
        </Button>
      </div>
    </div>
  );
}
