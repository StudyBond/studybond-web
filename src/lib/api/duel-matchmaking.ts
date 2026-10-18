import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

/** "Find a challenger". Mirrors the backend's DuelMatchmakingView. */
export type DuelMatchmakingState =
  | "IDLE"
  | "SEARCHING"
  | "MATCHED"
  | "STARTING"
  | "STARTED";

export type DuelNoticeCode =
  | "PARTNER_DECLINED"
  | "PARTNER_MISSED"
  | "YOU_MISSED"
  | "START_FAILED"
  | "SEARCH_ABANDONED"
  | "BOARD_CHANGED"
  | "LEFT_FOR_EXAM"
  | "NOT_ELIGIBLE";

export type DuelMatchmakingView = {
  state: DuelMatchmakingState;
  subjects: string[];
  anySubject: boolean;
  searchingSince: string | null;
  paused: boolean;
  match: {
    subject: string;
    opponentFirstName: string;
    iAmReady: boolean;
    opponentReady: boolean;
    secondsLeft: number;
    /** How long the duel will run: the normal time for its subject. */
    durationSeconds: number | null;
  } | null;
  sessionCode: string | null;
  notice: { code: DuelNoticeCode | string; at: string } | null;
  lookingNow: number;
};

export type DuelSearchPayload = {
  subjects: string[];
  anySubject: boolean;
};

export type DuelCheckInPayload = {
  visible: boolean;
  inExam: boolean;
};

export async function getDuelMatchmaking() {
  const response = await apiClient<SuccessEnvelope<DuelMatchmakingView>>(
    "/api/duel/matchmaking",
  );
  return response.data;
}

export async function searchForChallenger(payload: DuelSearchPayload) {
  const response = await apiClient<SuccessEnvelope<DuelMatchmakingView>>(
    "/api/duel/matchmaking/search",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return response.data;
}

export async function duelCheckIn(payload: DuelCheckInPayload) {
  const response = await apiClient<SuccessEnvelope<DuelMatchmakingView>>(
    "/api/duel/matchmaking/check-in",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return response.data;
}

export async function readyForDuel() {
  const response = await apiClient<SuccessEnvelope<DuelMatchmakingView>>(
    "/api/duel/matchmaking/ready",
    { method: "POST" },
  );
  return response.data;
}

/** "Stop searching", or "Not now" on a match. */
export async function cancelDuelSearch() {
  const response = await apiClient<SuccessEnvelope<DuelMatchmakingView>>(
    "/api/duel/matchmaking/cancel",
    { method: "POST" },
  );
  return response.data;
}
