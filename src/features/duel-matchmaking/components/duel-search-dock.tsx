"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Swords, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatDuelTime } from "@/features/duel/components/duel-duration-picker";
import { playVsClash } from "@/features/duel/lib/duel-sounds";
import {
  useCancelDuelSearchMutation,
  useDuelMatchmakingCache,
  useReadyForDuelMutation,
} from "@/features/duel-matchmaking/hooks/use-duel-matchmaking";
import {
  ACTIVE_FLAG_STORAGE_KEY,
  CHECK_IN_BAR_MS,
  CHECK_IN_FAST_MS,
  CHECK_IN_HIDDEN_MS,
  CHECK_IN_MATCHED_MS,
  DUEL_HOME_PATH,
  DUEL_MATCHMAKING_QUERY_KEY,
  claimDuelLaunch,
  duelRoomPath,
  describeSubjects,
  formatElapsed,
  hasActiveSearchFlag,
  isDuelHomePath,
  isExamPath,
  isSearchActive,
  noticeMessage,
  secondsSince,
  setActiveSearchFlag,
  takeUnseenNotice,
} from "@/features/duel-matchmaking/lib/matchmaking-store";
import { ApiError } from "@/lib/api/client";
import { duelCheckIn, type DuelMatchmakingView } from "@/lib/api/duel-matchmaking";
import { cn } from "@/lib/utils/cn";

/**
 * "Find a challenger", everywhere in the app.
 *
 * Mounted once for every signed-in page. While a search is running it checks
 * in with the server every few seconds: that is what keeps the student
 * findable, pauses them during an exam, and brings back the news that someone
 * wants to duel. It does not use the notification system.
 *
 * Shows a small bar while searching, a popup when a challenger is found, and
 * opens the duel once both have tapped Ready. Shows nothing on the exam
 * screen, but keeps checking in there so the server knows they are busy.
 */
export function DuelSearchDock() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: view } = useDuelMatchmakingCache();

  const [flag, setFlag] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    setFlag(hasActiveSearchFlag());
    // Another tab started or stopped a search.
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVE_FLAG_STORAGE_KEY) setFlag(hasActiveSearchFlag());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const active = isSearchActive(view?.state) || flag;

  // ─── Check-in loop ───
  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const nextDelay = (next: DuelMatchmakingView) => {
      if (document.visibilityState !== "visible") return CHECK_IN_HIDDEN_MS;
      if (next.state === "MATCHED" || next.state === "STARTING") return CHECK_IN_MATCHED_MS;
      if (isDuelHomePath(pathnameRef.current)) return CHECK_IN_FAST_MS;
      return CHECK_IN_BAR_MS;
    };

    const schedule = (ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, ms);
    };

    async function tick() {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const next = await duelCheckIn({
          visible: document.visibilityState === "visible",
          inExam: isExamPath(pathnameRef.current),
        });
        if (cancelled) return;
        queryClient.setQueryData(DUEL_MATCHMAKING_QUERY_KEY, next);
        if (isSearchActive(next.state)) {
          schedule(nextDelay(next));
        } else {
          setActiveSearchFlag(false);
          setFlag(false);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          // Signed out. Nothing to keep alive.
          setActiveSearchFlag(false);
          setFlag(false);
          return;
        }
        // Rate limited or offline: back off, the server keeps the search
        // for a few minutes without check-ins.
        schedule(error instanceof ApiError && error.status === 429 ? 30_000 : CHECK_IN_HIDDEN_MS);
      } finally {
        inFlight = false;
      }
    }

    void tick();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, queryClient]);

  // Check in at once when the student opens or leaves an exam, so the pause
  // starts and ends without waiting for the next tick.
  const onExamPage = isExamPath(pathname);
  useEffect(() => {
    if (!active) return;
    void duelCheckIn({
      visible: document.visibilityState === "visible",
      inExam: onExamPage,
    })
      .then((next) => queryClient.setQueryData(DUEL_MATCHMAKING_QUERY_KEY, next))
      .catch(() => undefined);
    // `active` is left out on purpose: the loop above already checks in when
    // a search starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExamPage]);

  // ─── React to what the server says ───
  const previousState = useRef(view?.state);
  useEffect(() => {
    if (!view) return;

    if (view.state === "MATCHED" && previousState.current !== "MATCHED" && previousState.current !== "STARTING") {
      playVsClash();
    }
    previousState.current = view.state;

    if (!isSearchActive(view.state)) {
      setActiveSearchFlag(false);
      setFlag(false);
    }

    if (view.state === "STARTED" && view.sessionCode && claimDuelLaunch(view.sessionCode)) {
      playVsClash();
      toast.success("Duel on! Opening your paper.");
      router.push(duelRoomPath(view.sessionCode) as Route);
    }

    const notice = takeUnseenNotice(view);
    if (notice) {
      const { text, tone } = noticeMessage(notice.code);
      if (tone === "warning") toast.warning(text, { duration: 7000 });
      else toast.info(text, { duration: 6000 });
    }
  }, [view, router]);

  // Flash the tab title while a challenger waits and the tab is hidden.
  const waitingOnMe = view?.state === "MATCHED" && !view.match?.iAmReady;
  useEffect(() => {
    if (!waitingOnMe) return;
    const original = document.title;
    let flashOn = false;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        document.title = original;
        flashOn = false;
        return;
      }
      flashOn = !flashOn;
      document.title = flashOn ? "⚔ Challenger found!" : original;
    }, 1000);
    return () => {
      clearInterval(id);
      document.title = original;
    };
  }, [waitingOnMe]);

  if (!mounted || !view || onExamPage) return null;

  if (view.state === "MATCHED" || view.state === "STARTING") {
    return createPortal(<MatchFoundDialog view={view} />, document.body);
  }

  if (view.state === "SEARCHING" && !isDuelHomePath(pathname)) {
    return createPortal(<SearchingBar view={view} />, document.body);
  }

  return null;
}

/** Ticks once a second so countdowns and timers move between check-ins. */
function useNow(enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled]);
  return now;
}

/**
 * The server's seconds-left, counted down locally between check-ins and reset
 * whenever a check-in brings a fresh number.
 */
function useCountdown(serverSeconds: number) {
  const [countdown, setCountdown] = useState({ from: serverSeconds, left: serverSeconds });
  if (countdown.from !== serverSeconds) {
    setCountdown({ from: serverSeconds, left: serverSeconds });
  }
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((current) => ({ ...current, left: Math.max(0, current.left - 1) }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return countdown.left;
}

function SearchingBar({ view }: { view: DuelMatchmakingView }) {
  const now = useNow(true);
  const cancelMutation = useCancelDuelSearchMutation();
  const elapsed = formatElapsed(secondsSince(view.searchingSince, now));

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-50 flex justify-center px-4 md:bottom-6"
    >
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-amber-500/20 bg-[#121318]/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {!view.paused && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" />
          )}
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 rounded-full",
              view.paused ? "bg-white/30" : "bg-amber-400",
            )}
          />
        </span>

        <Link href={DUEL_HOME_PATH as Route} className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white/85">
            {view.paused
              ? "Duel search paused during your exam"
              : `Looking for a ${describeSubjects(view)} challenger`}
          </p>
          <p className="text-[11px] text-white/40">
            {elapsed} · we&apos;ll pop up when someone&apos;s found
          </p>
        </Link>

        <button
          type="button"
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending}
          aria-label="Stop searching"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white/80 disabled:opacity-40"
        >
          {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function MatchFoundDialog({ view }: { view: DuelMatchmakingView }) {
  const match = view.match;
  const readyMutation = useReadyForDuelMutation();
  const cancelMutation = useCancelDuelSearchMutation();

  const secondsLeft = useCountdown(match?.secondsLeft ?? 0);

  const starting = view.state === "STARTING";
  const opponent = match?.opponentFirstName ?? "A student";
  const busy = readyMutation.isPending || cancelMutation.isPending;

  function handleReady() {
    readyMutation.mutate(undefined, {
      onError: (error) => toast.error(error instanceof Error ? error.message : "Could not reach StudyBond."),
    });
  }

  function handleNotNow() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => toast.info("No problem. We let them know."),
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duel-match-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#0d0e12] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
            <Swords className="h-3 w-3" />
            Challenger found
          </span>
          {!starting && (
            <span className="text-xs font-semibold tabular-nums text-white/40">{secondsLeft}s</span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/30 to-amber-500/20 text-xl font-extrabold text-white">
            {opponent.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 id="duel-match-title" className="text-lg font-bold leading-snug text-white">
              {opponent} wants a {match?.subject || "duel"} duel
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              {match?.durationSeconds
                ? `${formatDuelTime(match.durationSeconds)} on the clock. Same paper, one winner.`
                : "Same paper, same clock. One winner."}
            </p>
          </div>
        </div>

        {!starting && (
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-amber-400 transition-[width] duration-1000 ease-linear"
              style={{ width: `${Math.min(100, (secondsLeft / 30) * 100)}%` }}
            />
          </div>
        )}

        <div className="mt-6">
          {starting ? (
            <p className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white/70">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              Both ready. Setting up your duel…
            </p>
          ) : match?.iAmReady ? (
            <div className="space-y-3">
              <p className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white/70">
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                {match.opponentReady ? "Both ready. Starting…" : `Waiting for ${opponent} to tap Ready…`}
              </p>
              <button
                type="button"
                onClick={handleNotNow}
                disabled={busy}
                className="w-full text-center text-xs font-semibold text-white/35 transition hover:text-white/70 disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="lg" onClick={handleNotNow} disabled={busy}>
                Not now
              </Button>
              <Button size="lg" onClick={handleReady} isLoading={readyMutation.isPending} disabled={busy}>
                I&apos;m ready
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

