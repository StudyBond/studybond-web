"use client";

import { useState } from "react";
import { Clock, Minus, Plus, RotateCcw } from "lucide-react";

import { InlineError } from "@/components/ui/inline-error";
import { Surface } from "@/components/ui/surface";
import {
  useDuelDurationOptions,
  useUpdateDuelDurationMutation,
} from "@/features/duel/hooks/use-duel";
import type { DuelSession, DuelDurationOptions } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

/** "23 min", "22½ min", "1 h 30 min". */
export function formatDuelTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  if (seconds === 30) return `${minutes}½ min`;
  if (seconds > 0) return `${minutes} min ${seconds} s`;
  return `${minutes} min`;
}

/**
 * The host's duel time while they are still picking subjects. A choice only
 * holds for the subjects it was made for: change the subjects and it goes
 * back to the normal time, so a 33-minute pick for one subject never quietly
 * carries over to a four-subject paper.
 */
export function useDuelDurationChoice(subjects: string[], enabled = true) {
  const subjectsKey = [...subjects].sort().join(",");
  const options = useDuelDurationOptions(subjects, enabled);
  const [choice, setChoice] = useState<{ key: string; seconds: number } | null>(null);
  const value = choice?.key === subjectsKey ? choice.seconds : null;

  return {
    options: options.data,
    isLoading: options.isLoading,
    /** Null means the normal time. */
    value,
    setValue: (seconds: number | null) =>
      setChoice(seconds === null ? null : { key: subjectsKey, seconds }),
  };
}

type DuelDurationPickerProps = {
  options: DuelDurationOptions | undefined;
  /** Null means the normal time. */
  value: number | null;
  onChange: (seconds: number | null) => void;
  isLoading?: boolean;
  disabled?: boolean;
  /** Tighter layout for the lobby. */
  compact?: boolean;
};

export function DuelDurationPicker({
  options,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  compact = false,
}: DuelDurationPickerProps) {
  if (!options) {
    return (
      <div className={cn("flex items-center gap-2 text-[13px] text-white/40", compact && "text-xs")}>
        <Clock className="h-4 w-4" />
        {isLoading ? "Working out the duel time…" : "Pick subjects to see the duel time."}
      </div>
    );
  }

  const { defaultSeconds, minSeconds, maxSeconds, stepSeconds } = options;
  const current = value ?? defaultSeconds;
  const isNormal = current === defaultSeconds;

  function commit(next: number) {
    const clamped = Math.min(maxSeconds, Math.max(minSeconds, next));
    onChange(clamped === defaultSeconds ? null : clamped);
  }

  // A normal time like 22½ min steps to the whole minute on either side.
  const stepDown = () =>
    commit(current % stepSeconds === 0 ? current - stepSeconds : Math.floor(current / stepSeconds) * stepSeconds);
  const stepUp = () =>
    commit(current % stepSeconds === 0 ? current + stepSeconds : Math.ceil(current / stepSeconds) * stepSeconds);

  const buttonClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 transition hover:border-white/[0.12] hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={stepDown}
          disabled={disabled || current <= minSeconds}
          aria-label="One minute less"
          className={buttonClass}
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="min-w-[96px] text-center">
          <p className={cn("font-bold tabular-nums text-white", compact ? "text-base" : "text-lg")}>
            {formatDuelTime(current)}
          </p>
          <p className="text-[11px] text-white/35">{isNormal ? "Normal time" : "Custom time"}</p>
        </div>

        <button
          type="button"
          onClick={stepUp}
          disabled={disabled || current >= maxSeconds}
          aria-label="One minute more"
          className={buttonClass}
        >
          <Plus className="h-4 w-4" />
        </button>

        {!isNormal && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-amber-300/80 transition hover:bg-amber-500/[0.08] hover:text-amber-200 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Use normal time
          </button>
        )}
      </div>

      {maxSeconds - minSeconds > stepSeconds * 10 && (
        <input
          type="range"
          min={minSeconds}
          max={maxSeconds}
          step={stepSeconds}
          value={current}
          disabled={disabled}
          onChange={(event) => commit(Number(event.target.value))}
          aria-label="Duel time"
          className="w-full max-w-sm accent-amber-400 disabled:opacity-40"
        />
      )}

      <p className="text-[12px] text-white/35">
        Normal time for these subjects is {formatDuelTime(defaultSeconds)}. You can set anything from{" "}
        {formatDuelTime(minSeconds)} to {formatDuelTime(maxSeconds)}.
      </p>
    </div>
  );
}

/**
 * The duel time in the lobby. Both players see it; the host can change it
 * until the duel starts. The lobby refreshes every few seconds, so the other
 * player sees a change almost at once.
 */
export function LobbyDuelTime({
  session,
  isHost,
}: {
  session: DuelSession;
  isHost: boolean;
}) {
  const waiting = session.status === "WAITING";
  const options = useDuelDurationOptions(session.subjects, waiting);
  const updateMutation = useUpdateDuelDurationMutation();
  const [error, setError] = useState<string | null>(null);

  // A duel started before duel times existed: its clock lives in the exam.
  if (!waiting && session.durationSeconds === null) return null;

  const current = session.durationSeconds ?? options.data?.defaultSeconds ?? null;
  const canEdit = isHost && waiting;

  function handleChange(seconds: number | null) {
    if (!options.data) return;
    setError(null);
    updateMutation.mutate(
      { sessionId: session.id, durationSeconds: seconds ?? options.data.defaultSeconds },
      {
        onError: (mutationError) =>
          setError(mutationError instanceof Error ? mutationError.message : "Could not change the duel time."),
      },
    );
  }

  return (
    <Surface className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[var(--sb-accent)]" />
        <p className="text-sm font-medium text-white/80">Duel time</p>
      </div>

      {canEdit ? (
        <DuelDurationPicker
          options={options.data}
          value={
            session.durationSeconds !== null && session.durationSeconds !== options.data?.defaultSeconds
              ? session.durationSeconds
              : null
          }
          onChange={handleChange}
          isLoading={options.isLoading}
          disabled={updateMutation.isPending}
          compact
        />
      ) : (
        <p className="text-sm text-white/55">
          {current !== null ? (
            <>
              <span className="font-semibold text-white/85">{formatDuelTime(current)}</span> on the clock for
              both of you.
            </>
          ) : (
            "Working out the duel time…"
          )}
          {waiting ? " The host can change it before the duel starts." : null}
        </p>
      )}

      {error ? (
        <div className="mt-3">
          <InlineError message={error} />
        </div>
      ) : null}
    </Surface>
  );
}
