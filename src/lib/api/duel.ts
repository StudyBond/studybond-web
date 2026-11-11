import { apiClient } from "@/lib/api/client";
import type { Subject } from "@/lib/api/exams";
import type {
  DuelQuestionSource,
  DuelSessionSnapshot,
  DuelStartResult,
  DuelDurationOptions,
  SuccessEnvelope,
} from "@/lib/api/types";

export type CreateDuelPayload = {
  sessionType?: "ONE_V_ONE_DUEL";
  institutionCode?: string;
  subjects: Subject[];
  questionSource?: DuelQuestionSource;
  maxParticipants?: 2;
  customName?: string | null;
  /** Left out for the normal time. */
  durationSeconds?: number;
  /** One subject, 15 taster questions, 14 minutes. Always on for free hosts. */
  isTaster?: boolean;
};

export async function createDuelSession(
  payload: CreateDuelPayload,
) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    "/api/duel/create",
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "idempotency-key": `duel-create-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function getDuelSessionByCode(code: string) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    `/api/duel/code/${encodeURIComponent(code)}`,
  );

  return response.data;
}

export async function joinDuelSession(code: string) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    `/api/duel/code/${encodeURIComponent(code)}/join`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `duel-join-${code}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function startDuelSession(sessionId: number) {
  const response = await apiClient<SuccessEnvelope<DuelStartResult>>(
    `/api/duel/sessions/${sessionId}/start`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `duel-start-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function leaveDuelSession(sessionId: number) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    `/api/duel/sessions/${sessionId}/leave`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `duel-leave-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function cancelDuelSession(sessionId: number) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    `/api/duel/sessions/${sessionId}/cancel`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `duel-cancel-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function getDuelDurationOptions(subjects: string[]) {
  const query = encodeURIComponent(subjects.join(","));
  const response = await apiClient<SuccessEnvelope<DuelDurationOptions>>(
    `/api/duel/duration-options?subjects=${query}`,
  );

  return response.data;
}

export async function updateDuelDuration(
  sessionId: number,
  durationSeconds: number,
) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    `/api/duel/sessions/${sessionId}/duration`,
    {
      method: "PATCH",
      body: JSON.stringify({ durationSeconds }),
      headers: {
        "idempotency-key": `duel-duration-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function updateDuelSessionName(
  sessionId: number,
  customName: string | null,
) {
  const response = await apiClient<SuccessEnvelope<DuelSessionSnapshot>>(
    `/api/duel/sessions/${sessionId}/name`,
    {
      method: "PATCH",
      body: JSON.stringify({ customName }),
      headers: {
        "idempotency-key": `duel-name-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

/* ─── Duel phase two (2026-11-08) ────────────────────────────────────────
   Types for the new routes live here, not in types.ts, so this feature's
   API stays in one file. See studybond-backend/docs/duel-api-changes.md. */

export type DuelKind = "ROOM" | "MATCHED" | "CHALLENGE";
export type DuelResultLetter = "W" | "L" | "D";
export type GhostLevel = "STEADY" | "STRONG" | "TOP";

/** The duel snapshot's fields added in phase two. */
export type DuelSessionExtras = {
  kind: DuelKind;
  isTaster: boolean;
  /** Winner 1.5x SP, loser normal SP, draw 1.5x each. False on older duels. */
  winnerTakesBonus: boolean;
  expiresAt: string | null;
  challengedUserId: number | null;
  declinedAt: string | null;
  rematchOfSessionId: number | null;
  participants: Array<DuelSessionSnapshot["session"]["participants"][number] & { readyAt: string | null }>;
};

export type DuelSessionFull = Omit<DuelSessionSnapshot["session"], "participants"> & DuelSessionExtras;

export type DuelRecord = {
  won: number;
  lost: number;
  drawn: number;
  currentWinRun: number;
  bestWinRun: number;
};

export type HeadToHead = {
  opponentId: number;
  wins: number;
  losses: number;
  draws: number;
  /** Up to the last five, oldest first. */
  form: DuelResultLetter[];
  lastDuel: {
    sessionId: number;
    result: DuelResultLetter;
    myScore: number;
    opponentScore: number;
    endedAt: string | null;
  } | null;
};

export type IncomingChallenge = {
  sessionId: number;
  code: string;
  subjects: string[];
  totalQuestions: number;
  durationSeconds: number | null;
  questionSource: string;
  isTaster: boolean;
  isRematch: boolean;
  expiresAt: string | null;
  sentAt: string;
  from: { userId: number; fullName: string; course: string | null };
  headToHead: HeadToHead;
};

export type DuelHome = {
  board: { id: number; code: string; name: string };
  record: DuelRecord;
  rivals: Array<HeadToHead & { opponentName: string }>;
  recent: Array<{
    sessionId: number;
    result: DuelResultLetter;
    opponentId: number;
    opponentName: string;
    myScore: number;
    opponentScore: number;
    isTaster: boolean;
    subjects: string[];
    endedAt: string | null;
  }>;
  incomingChallenges: IncomingChallenge[];
  /** Free students who asked you for a taster from a full-paper slip. Older servers leave it out. */
  tasterRequests?: TasterRequest[];
  freeDuel: {
    isPremium: boolean;
    /** Free students only: this week's free duel is unused. Null for premium. */
    available: boolean | null;
    weekStartDate: string;
    nextFreeDuelAt: string;
    usedAt: string | null;
    usedOnGhostRace: boolean;
    lastFreeDuel: { result: DuelResultLetter; opponentName: string } | null;
    /** Free students: when premium on this board last ended. Missing on older servers. */
    premiumEndedAt?: string | null;
  };
  reactions: Array<{ key: string; label: string }>;
};

export type TasterRequest = {
  requestId: number;
  askedAt: string;
  from: { userId: number; fullName: string; course: string | null };
};

export type FaceOffPlayer = {
  userId: number;
  fullName: string;
  course: string | null;
  weeklyRank: number | null;
  record: DuelRecord;
};

export type FaceOff = {
  sessionId: number;
  players: FaceOffPlayer[];
  headToHead: HeadToHead | null;
};

export type RivalAnswer = {
  questionId: number;
  /** The question's own letter, whatever order it was shown in. */
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
};

export type RivalAnswers = {
  sessionId: number;
  rival: { userId: number; fullName: string };
  rivalScore: number;
  rivalTimeTakenSeconds: number | null;
  rivalSubmitted: boolean;
  /** Free students see the score, not the picks and times. */
  locked: boolean;
  answers: RivalAnswer[];
};

export type GhostOptions = {
  subject: string;
  isPremium: boolean;
  isTaster: boolean;
  totalQuestions: number;
  durationSeconds: number;
  racesLeftToday: number | null;
  racesPerDay: number | null;
  freeDuelAvailable: boolean | null;
  nextFreeDuelAt: string | null;
  levels: Array<{
    level: GhostLevel;
    label: string;
    who: string;
    expectedScore: number;
    secondsPerQuestion: number;
  }>;
};

export type GhostStart = {
  examId: number;
  subject: string;
  level: GhostLevel;
  levelLabel: string;
  isTaster: boolean;
  totalQuestions: number;
  durationSeconds: number;
  startedAt: string;
  /** Seconds the ghost spends on each question, in paper order. */
  ghostTimeline: number[];
};

export type GhostResult = {
  examId: number;
  subject: string | null;
  level: GhostLevel;
  levelLabel: string;
  isTaster: boolean;
  totalQuestions: number;
  myScore: number;
  ghostScore: number;
  result: DuelResultLetter;
  spEarned: number;
  ghostAnswers: Array<RivalAnswer & { fromRealAnswer: boolean }>;
};

type FullSnapshot = { session: DuelSessionFull; myExamId?: number | null };

function idem(prefix: string) {
  return { "idempotency-key": `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
}

export async function getDuelHome() {
  return (await apiClient<SuccessEnvelope<DuelHome>>("/api/duel/home")).data;
}

/** The face-off's "I'm ready". The duel starts by itself once both are ready. */
export async function tapDuelReady(sessionId: number) {
  return (
    await apiClient<SuccessEnvelope<{ session: DuelSessionFull; myExamId: number | null; started: boolean }>>(
      `/api/duel/sessions/${sessionId}/ready`,
      { method: "POST", headers: idem(`duel-ready-${sessionId}`) },
    )
  ).data;
}

export async function getDuelFaceOff(sessionId: number) {
  return (await apiClient<SuccessEnvelope<FaceOff>>(`/api/duel/sessions/${sessionId}/face-off`)).data;
}

export async function getRivalAnswers(sessionId: number) {
  return (await apiClient<SuccessEnvelope<RivalAnswers>>(`/api/duel/sessions/${sessionId}/rival-answers`)).data;
}

/** Rematch. With a subject (one of the old duel's), it goes out as a one-subject taster. */
export async function requestRematch(sessionId: number, subject?: string) {
  return (
    await apiClient<SuccessEnvelope<FullSnapshot>>(`/api/duel/sessions/${sessionId}/rematch`, {
      method: "POST",
      headers: idem(`duel-rematch-${sessionId}`),
      ...(subject ? { body: JSON.stringify({ subject }) } : {}),
    })
  ).data;
}

/** A duel I was in, by id (the rematch sheet reads the old paper's subjects). */
export async function getDuelSessionById(sessionId: number) {
  return (await apiClient<SuccessEnvelope<FullSnapshot>>(`/api/duel/sessions/${sessionId}`)).data;
}

export async function createDuelChallenge(payload: CreateDuelPayload & { challengedUserId: number; isTaster?: boolean }) {
  return (
    await apiClient<SuccessEnvelope<FullSnapshot>>("/api/duel/challenges", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: idem(`duel-challenge-${payload.challengedUserId}`),
    })
  ).data;
}

export async function acceptDuelChallenge(sessionId: number) {
  return (
    await apiClient<SuccessEnvelope<FullSnapshot>>(`/api/duel/challenges/${sessionId}/accept`, {
      method: "POST",
      headers: idem(`duel-accept-${sessionId}`),
    })
  ).data;
}

export async function declineDuelChallenge(sessionId: number) {
  return (
    await apiClient<SuccessEnvelope<{ declined: boolean }>>(`/api/duel/challenges/${sessionId}/decline`, {
      method: "POST",
    })
  ).data;
}

export async function getGhostOptions(subject: string) {
  return (
    await apiClient<SuccessEnvelope<GhostOptions>>(`/api/duel/ghosts/options?subject=${encodeURIComponent(subject)}`)
  ).data;
}

export async function startGhostRace(subject: string, level: GhostLevel) {
  return (
    await apiClient<SuccessEnvelope<GhostStart>>("/api/duel/ghosts/start", {
      method: "POST",
      body: JSON.stringify({ subject, level }),
      headers: idem("duel-ghost"),
    })
  ).data;
}

export async function getGhostResult(examId: number) {
  return (await apiClient<SuccessEnvelope<GhostResult>>(`/api/duel/ghosts/${examId}`)).data;
}

/** A full snapshot, with the phase-two fields typed. */
export async function getDuelByCode(code: string) {
  return (
    await apiClient<SuccessEnvelope<FullSnapshot>>(`/api/duel/code/${encodeURIComponent(code)}`)
  ).data;
}

/* ─── Invite landing + taster requests (Phase 3) ──────────────────────── */

/** What a slip link shows to anyone, signed in or not. No private data. */
export type DuelInvite = {
  code: string;
  status: "OPEN" | "FULL" | "STARTED" | "FINISHED" | "CANCELLED" | "EXPIRED";
  kind: DuelKind;
  isTaster: boolean;
  questionSource: string;
  subjects: string[];
  totalQuestions: number;
  durationSeconds: number | null;
  expiresAt: string | null;
  board: { code: string; name: string; trackName: string | null };
  host: { firstName: string; shortName: string; course: string | null; weeklyRank: number | null };
};

export async function getDuelInvite(code: string) {
  return (
    await apiClient<SuccessEnvelope<DuelInvite>>(`/api/duel/invites/${encodeURIComponent(code.replace(/[^A-Z0-9]/gi, "").toUpperCase())}`)
  ).data;
}

/** A free student on a full-paper slip asks the host for a taster instead. */
export async function askForTaster(sessionId: number) {
  return (
    await apiClient<SuccessEnvelope<{ asked: boolean; alreadyAsked: boolean }>>(
      `/api/duel/sessions/${sessionId}/ask-taster`,
      { method: "POST", headers: idem(`duel-ask-taster-${sessionId}`) },
    )
  ).data;
}

export async function dismissTasterRequest(requestId: number) {
  return (
    await apiClient<SuccessEnvelope<{ dismissed: boolean }>>(`/api/duel/taster-requests/${requestId}/dismiss`, {
      method: "POST",
    })
  ).data;
}
