"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/features/avatar/components/avatar";
import { AVATAR_OPTIONS, normaliseLook, randomLook, type AvatarLook } from "@/features/avatar/avatar-look";
import { useMyAvatar, useSaveAvatar } from "@/features/avatar/hooks/use-my-avatar";
import { boardSounds } from "@/features/leaderboard/lib/board-sounds";
import { shortDate, shortName } from "@/features/leaderboard/lib/names";
import { departmentLabel } from "@/features/institution/components/department-picker";
import type { AvatarFrames } from "@/lib/api/avatar";
import type { UserProfile } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import styles from "./avatar-maker.module.css";
import { BoardToast } from "@/features/leaderboard/components/board-toast";

type FrameRow = {
  id: string;
  label: string;
  how: string;
  status: string;
  earned: boolean;
  pct: number | null;
};

function frameRows(frames: AvatarFrames | undefined): FrameRow[] {
  const merit = frames?.merit;
  const duel = frames?.duel;
  const streak = frames?.streak;
  const pct = (current: number, target: number) => Math.min(100, Math.round((current / Math.max(1, target)) * 100));

  return [
    { id: "none", label: "No frame", how: "Plain avatar", status: "", earned: true, pct: null },
    {
      id: "merit",
      label: "Merit list",
      how: merit?.best
        ? `Finish a week in the top 10. You did: #${merit.best.rank}, week of ${shortDate(merit.best.weekStartDate)}.`
        : `Finish a week in the top 10. Weeks count when ${merit?.minPlayers ?? 30} or more students score.`,
      status: merit?.earned ? "Earned" : "Not yet",
      earned: Boolean(merit?.earned),
      pct: null,
    },
    {
      id: "duel",
      label: "Duel winner",
      how: `Win ${duel?.target ?? 10} duels. You have ${duel?.current ?? 0}.`,
      status: duel?.earned ? "Earned" : `${duel?.current ?? 0} / ${duel?.target ?? 10}`,
      earned: Boolean(duel?.earned),
      pct: duel && !duel.earned ? pct(duel.current, duel.target) : null,
    },
    {
      id: "streak",
      label: "30-day streak",
      how: streak?.earned
        ? `Practise 30 days in a row. Your best is ${streak.longest}.`
        : `Practise 30 days in a row. You are on ${streak?.current ?? 0}.`,
      status: streak?.earned ? "Earned" : `${streak?.current ?? 0} / ${streak?.target ?? 30}`,
      earned: Boolean(streak?.earned),
      pct: streak && !streak.earned ? pct(streak.current, streak.target) : null,
    },
  ];
}

function sameLook(a: AvatarLook, b: AvatarLook): boolean {
  return (Object.keys(a) as Array<keyof AvatarLook>).every((part) => a[part] === b[part]);
}

type AvatarMakerProps = {
  profile: UserProfile;
};

export function AvatarMaker({ profile }: Readonly<AvatarMakerProps>) {
  const mine = useMyAvatar();
  const save = useSaveAvatar();

  const savedLook = useMemo(() => (mine.data ? normaliseLook(mine.data.avatar) : null), [mine.data]);
  /* The student's unsaved edits; until they touch anything, the saved look. */
  const [draft, setDraft] = useState<AvatarLook | null>(null);
  const look = draft ?? savedLook;
  const [bump, setBump] = useState(0);
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast((current) => ({ key: (current?.key ?? 0) + 1, text }));
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  if (mine.isLoading || !look || !savedLook) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#e09040] opacity-60" />
      </div>
    );
  }

  const isDefault = Boolean(mine.data?.avatar.isDefault);
  const changed = isDefault || !sameLook(look, savedLook);
  const covered = look.head === "hijab";
  const frames = frameRows(mine.data?.frames);
  const course = profile.aspiringCourse || (profile.department ? departmentLabel(profile.department) : "");

  const set = (part: Partial<AvatarLook>) => {
    boardSounds.tap();
    setDraft({ ...look, ...part });
    setBump((value) => value + 1);
  };

  const onSave = async () => {
    try {
      await save.mutateAsync(look);
      boardSounds.save();
      showToast("Saved to your account. Everyone sees it on the leaderboard and in duels, on any phone you log in from.");
    } catch (error) {
      boardSounds.no();
      showToast(error instanceof ApiError ? error.message : "We couldn't save your avatar. Check your connection and try again.");
    }
  };

  const saveButton = (
        <button
          type="button"
          onClick={onSave}
          disabled={!changed || save.isPending}
          className={cn(styles.save, "flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#e09040] text-[#0a0a0a] shadow-[0_4px_24px_rgba(224,144,64,0.15)] transition hover:bg-[#e8a058] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-[#e09040]")}
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {changed ? "Save avatar" : "Saved"}
        </button>
  );

  return (
    /* A size container: wide enough and the preview moves into a panel on
       the left that stays in view, with the parts on the right. */
    <div className={styles.frame}>
    <div className={cn("sb-ui", styles.root, styles.layout, "relative mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-[480px] flex-col")}>
      <header className={cn(styles.header, "flex h-14 flex-none items-center gap-1 border-b border-[var(--rule)] pl-1 pr-2.5")}>
        <Link
          href="/dashboard/settings"
          aria-label="Back to profile"
          className="grid h-11 w-11 place-items-center rounded-[10px] text-[var(--ink-2)] hover:bg-[var(--sheet)] hover:text-[var(--ink)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className={cn(styles.head, styles.title, "mr-auto ml-0.5 text-[17px] font-bold")}>Your avatar</h1>
        <button
          type="button"
          onClick={() => {
            set(randomLook(look.frame));
          }}
          className={cn(styles.surprise, "min-h-10 rounded-lg bg-white/5 px-3 text-white/80 ring-1 ring-inset ring-white/[0.08] hover:bg-white/[0.08]")}
        >
          Surprise me
        </button>
      </header>

      <div className={styles.side}>
      <section aria-label="Preview" className={cn(styles.preview, "grid justify-items-center gap-2.5 border-b border-[var(--rule)] bg-[var(--sheet)] px-[18px] pb-[18px] pt-[22px]")}>
        <div key={bump} className={bump % 2 ? styles.bump : styles.bumpAlt}>
          <Avatar look={look} size={148} label="Your avatar" />
        </div>
        <b className={cn(styles.head, "mt-1.5 text-[19px] font-extrabold")}>{shortName(profile.fullName)}</b>
        {course ? <span className="-mt-2 text-[13px] text-[var(--ink-3)]">{course}</span> : null}
        <div className="mt-1 flex items-center gap-4 rounded-[10px] bg-[var(--desk)] px-3 py-2 text-xs text-[var(--ink-3)]">
          <span className="flex items-center gap-[7px]">
            <Avatar look={look} size={36} />
            On the leaderboard
          </span>
          <span className="flex items-center gap-[7px]">
            <Avatar look={look} size={24} />
            In a duel
          </span>
        </div>
      </section>

      <div className={cn(styles.saveBar, "sticky bottom-0 z-10 flex-none border-t border-[var(--rule)] bg-[var(--desk)] px-4 pb-4 pt-3")}>
        {saveButton}
      </div>
      </div>

      <div className={cn(styles.parts, "flex-1 pb-6")}>
        <Part title="Skin tone">
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.skin.map((option) => (
              <Swatch key={option.id} hex={option.hex} label={option.label} on={look.skin === option.id} onPick={() => set({ skin: option.id })} />
            ))}
          </div>
        </Part>

        <Part title="Hair" note={covered ? "hidden under your hijab" : undefined}>
          <div className={cn(styles.thumbs, "grid grid-cols-3 gap-2")}>
            {AVATAR_OPTIONS.hair.map((option) => (
              <Thumb
                key={option.id}
                label={option.label}
                on={look.hair === option.id}
                dim={covered}
                look={{ ...look, hair: option.id, head: covered ? "none" : look.head }}
                onPick={() => set({ hair: option.id })}
              />
            ))}
          </div>
        </Part>

        <Part title="On your head">
          <div className={cn(styles.thumbs, "grid grid-cols-3 gap-2")}>
            {AVATAR_OPTIONS.head.map((option) => (
              <Thumb key={option.id} label={option.label} on={look.head === option.id} look={{ ...look, head: option.id }} onPick={() => set({ head: option.id })} />
            ))}
          </div>
        </Part>

        <Part title="Glasses">
          <div className="flex flex-wrap gap-1.5">
            {AVATAR_OPTIONS.glasses.map((option) => {
              const on = look.glasses === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ glasses: option.id })}
                  className={cn(
                    styles.pill,
                    "min-h-11 rounded-full px-4",
                    on
                      ? "bg-[#e09040]/[0.12] text-[var(--mark-ink)] ring-1 ring-inset ring-[#e09040]/[0.32]"
                      : "text-[var(--ink-2)] ring-1 ring-inset ring-[var(--rule)] hover:bg-[var(--sheet)]",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Part>

        <Part title="Clothes colour" note="also used for headwear">
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.top.map((option) => (
              <Swatch key={option.id} hex={option.hex} label={option.label} on={look.top === option.id} onPick={() => set({ top: option.id })} />
            ))}
          </div>
        </Part>

        <Part title="Background">
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.bg.map((option) => (
              <Swatch key={option.id} hex={option.hex} label={`${option.label} background`} on={look.bg === option.id} onPick={() => set({ bg: option.id })} />
            ))}
          </div>
        </Part>

        <Part title="Frames" note="earned, not bought">
          <div className={cn(styles.frames, "grid gap-2")}>
            {frames.map((frame) => {
              const on = look.frame === frame.id;
              const wearing = on && frame.earned;
              return (
                <button
                  key={frame.id}
                  type="button"
                  aria-pressed={on}
                  aria-disabled={!frame.earned}
                  onClick={() => {
                    if (!frame.earned) {
                      boardSounds.no();
                      return;
                    }
                    set({ frame: frame.id });
                  }}
                  className={cn(
                    "grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                    on
                      ? "bg-[#e09040]/[0.08] ring-[1.5px] ring-inset ring-[#e09040]"
                      : "ring-1 ring-inset ring-[var(--rule)]",
                    frame.earned ? "hover:bg-[var(--sheet)]" : "cursor-default",
                  )}
                >
                  <Avatar look={{ ...look, frame: frame.id }} size={44} />
                  <div className="grid min-w-0 gap-0.5">
                    <b className="text-[14.5px]">{frame.label}</b>
                    <small className="text-[12.5px] text-[var(--ink-3)]">{frame.how}</small>
                    {frame.pct !== null ? (
                      <span className="mt-1 block h-1 w-full overflow-hidden rounded-sm bg-[var(--rule)]" aria-hidden="true">
                        <i className="block h-full bg-[#e87b2e]" style={{ width: `${frame.pct}%` }} />
                      </span>
                    ) : null}
                  </div>
                  <span className={cn("text-xs font-extrabold", frame.earned ? "text-[var(--good)]" : "text-[var(--ink-3)]")}>
                    {wearing && frame.id !== "none" ? "Wearing" : frame.status}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">
            Your frame shows wherever your avatar does, so people know what you&apos;ve done before you even duel them.
          </p>
        </Part>
      </div>

      <BoardToast toast={toast} />
    </div>
    </div>
  );
}

function Part({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="px-[18px] pt-[18px]">
      <h2 className={cn(styles.head, "mb-2.5 flex items-baseline justify-between text-[15px] font-extrabold")}>
        {title}
        {note ? <small className="text-[12.5px] font-semibold text-[var(--ink-3)]">{note}</small> : null}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ hex, label, on, onPick }: { hex?: string; label: string; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={onPick}
      className="h-11 w-11 rounded-full"
      style={{
        background: hex,
        boxShadow: on ? "0 0 0 2px #09090b, 0 0 0 4px #e09040" : "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    />
  );
}

function Thumb({ label, on, dim, look, onPick }: { label: string; on: boolean; dim?: boolean; look: AvatarLook; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={cn(
        styles.tile,
        "grid justify-items-center gap-1.5 rounded-xl px-1 pb-2 pt-2.5",
        on
          ? "bg-[#e09040]/[0.08] text-[var(--ink)] ring-[1.5px] ring-inset ring-[#e09040]"
          : "text-[var(--ink-2)] ring-1 ring-inset ring-[var(--rule)] hover:bg-[var(--sheet)]",
        dim && "opacity-45",
      )}
    >
      <Avatar look={{ ...look, frame: "none" }} size={52} />
      {label}
    </button>
  );
}
