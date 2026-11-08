import type {
  DuelSession,
  DuelSessionStatus,
} from "@/lib/api/types";

const STORAGE_KEY = "sb-duel-recent-rooms";
/** Where this list lived before the duel rename. Read once, then moved. */
const LEGACY_STORAGE_KEY = "sb-collaboration-recent-rooms";
const MAX_RECENT_ROOMS = 4;

export type RecentDuelRoom = {
  sessionId: number;
  code: string;
  effectiveDisplayName: string;
  questionSource: string;
  subjects: string[];
  status: DuelSessionStatus;
  updatedAt: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getRecentDuelRooms(): RecentDuelRoom[] {
  if (!isBrowser()) return [];

  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return [];
      window.localStorage.setItem(STORAGE_KEY, raw);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const parsed = JSON.parse(raw) as RecentDuelRoom[];
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function rememberDuelRoom(session: DuelSession) {
  if (!isBrowser()) return;

  const nextEntry: RecentDuelRoom = {
    sessionId: session.id,
    code: session.code,
    effectiveDisplayName: session.effectiveDisplayName,
    questionSource: session.questionSource,
    subjects: session.subjects,
    status: session.status,
    updatedAt: new Date().toISOString(),
  };

  const existing = getRecentDuelRooms().filter(
    (room) => room.code !== session.code,
  );

  const next = [nextEntry, ...existing].slice(0, MAX_RECENT_ROOMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearRecentDuelRooms() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
