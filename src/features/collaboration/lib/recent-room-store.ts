import type {
  CollaborationSession,
  CollaborationSessionStatus,
} from "@/lib/api/types";

const STORAGE_KEY = "sb-collaboration-recent-rooms";
const MAX_RECENT_ROOMS = 4;

export type RecentCollaborationRoom = {
  sessionId: number;
  code: string;
  effectiveDisplayName: string;
  questionSource: string;
  subjects: string[];
  status: CollaborationSessionStatus;
  updatedAt: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getRecentCollaborationRooms(): RecentCollaborationRoom[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as RecentCollaborationRoom[];
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function rememberCollaborationRoom(session: CollaborationSession) {
  if (!isBrowser()) return;

  const nextEntry: RecentCollaborationRoom = {
    sessionId: session.id,
    code: session.code,
    effectiveDisplayName: session.effectiveDisplayName,
    questionSource: session.questionSource,
    subjects: session.subjects,
    status: session.status,
    updatedAt: new Date().toISOString(),
  };

  const existing = getRecentCollaborationRooms().filter(
    (room) => room.code !== session.code,
  );

  const next = [nextEntry, ...existing].slice(0, MAX_RECENT_ROOMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearRecentCollaborationRooms() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
