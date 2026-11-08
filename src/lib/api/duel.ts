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
