"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { getDashboardHome, homeKeys, type DashboardHome } from "./api";

/* The last Home reply is kept on this device, so the page stays readable
   offline ("You're offline. This is your page from 4:12 pm."). Keyed per
   account: a shared phone never shows one student another's page. */
const STORE_PREFIX = "sb-home-copy:";

type SavedCopy = { savedAt: string; data: DashboardHome };

function readCopy(key: string): SavedCopy | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const copy = JSON.parse(raw) as SavedCopy;
    return copy && copy.data && copy.savedAt ? copy : null;
  } catch {
    return null;
  }
}

function writeCopy(key: string, data: DashboardHome) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), data }));
  } catch {
    // Private window or full storage: the live page still works.
  }
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

export type HomeState = {
  data: DashboardHome | null;
  /** Showing the saved copy because the network failed. */
  offline: boolean;
  /** When the saved copy was taken (offline only). */
  savedAt: string | null;
  /** Nothing to show yet and it is taking a while. */
  slow: boolean;
  loading: boolean;
  error: boolean;
  /** Server time minus device time, in ms. Counts "time left" from the server's clock. */
  skewMs: number;
  refetch: () => void;
};

export function useHome(userId: number | null | undefined): HomeState {
  const online = useOnline();
  const storeKey = userId ? `${STORE_PREFIX}${userId}` : null;
  const [slowTimerFired, setSlowTimerFired] = useState(false);
  /* Re-read when the connection drops, so the copy is the newest one. */
  const saved = useMemo(
    () => (storeKey && typeof window !== "undefined" && !online ? readCopy(storeKey) : null),
    [storeKey, online],
  );

  const query = useQuery({
    queryKey: homeKeys.home,
    queryFn: getDashboardHome,
    enabled: Boolean(userId),
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data && storeKey) writeCopy(storeKey, query.data);
  }, [query.data, storeKey]);

  /* Server clock minus device clock, taken when the reply arrived. */
  const skewMs = query.data ? Date.parse(query.data.serverNow) - query.dataUpdatedAt : 0;

  /* 9 pm and midnight change what Home shows: ask again at that moment. */
  const nextChange = query.data?.clock.nextChangeAt;
  const { refetch } = query;
  useEffect(() => {
    if (!nextChange) return;
    const wait = Date.parse(nextChange) - (Date.now() + skewMs) + 1500;
    if (wait <= 0 || wait > 24 * 3600 * 1000) return;
    const timer = window.setTimeout(() => void refetch(), wait);
    return () => window.clearTimeout(timer);
  }, [nextChange, skewMs, refetch]);

  const waiting = !query.data && (query.isLoading || query.isFetching);
  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => setSlowTimerFired(true), 2500);
    return () => {
      window.clearTimeout(timer);
      setSlowTimerFired(false);
    };
  }, [waiting]);
  const slow = waiting && slowTimerFired;

  return useMemo(() => {
    const failed = query.isError || !online;
    if (query.data && (online || !saved)) {
      return { data: query.data, offline: !online, savedAt: null, slow: false, loading: false, error: false, skewMs, refetch: () => void refetch() };
    }
    if (failed && saved) {
      return { data: saved.data, offline: true, savedAt: saved.savedAt, slow: false, loading: false, error: false, skewMs: Date.parse(saved.data.serverNow) - Date.parse(saved.savedAt), refetch: () => void refetch() };
    }
    return {
      data: null,
      offline: !online,
      savedAt: null,
      slow,
      loading: waiting || !userId,
      error: query.isError,
      skewMs,
      refetch: () => void refetch(),
    };
  }, [query.data, query.isError, online, saved, slow, waiting, userId, skewMs, refetch]);
}

/* ── Hear: British English only ── */

/**
 * The first British English voice on this device, or null. Voices often
 * load late, so this also listens for voiceschanged. With no British voice
 * the Hear button is hidden: never an American voice, because the IPA on
 * the card and JAMB's oral English are British.
 */
export function useBritishVoice(): SpeechSynthesisVoice | null {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const pick = () => {
      const voices = synth.getVoices();
      const gb = voices.filter((v) => v.lang.replace("_", "-").toLowerCase() === "en-gb");
      setVoice(gb.find((v) => v.localService) ?? gb[0] ?? null);
    };
    pick();
    synth.addEventListener("voiceschanged", pick);
    return () => synth.removeEventListener("voiceschanged", pick);
  }, []);
  return voice;
}

export function speakBritish(voice: SpeechSynthesisVoice, text: string) {
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    synth.speak(utterance);
  } catch {
    // Speech can fail on some browsers; the card still shows the IPA.
  }
}
