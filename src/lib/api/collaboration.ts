import { apiClient } from "@/lib/api/client";
import type { Subject } from "@/lib/api/exams";
import type {
  CollaborationQuestionSource,
  CollaborationSessionSnapshot,
  CollaborationStartResult,
  SuccessEnvelope,
} from "@/lib/api/types";

export type CreateCollaborationPayload = {
  sessionType?: "ONE_V_ONE_DUEL";
  institutionCode?: string;
  subjects: Subject[];
  questionSource?: CollaborationQuestionSource;
  maxParticipants?: 2;
  customName?: string | null;
};

export async function createCollaborationSession(
  payload: CreateCollaborationPayload,
) {
  const response = await apiClient<SuccessEnvelope<CollaborationSessionSnapshot>>(
    "/api/collaboration/create",
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "idempotency-key": `collaboration-create-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function getCollaborationSessionByCode(code: string) {
  const response = await apiClient<SuccessEnvelope<CollaborationSessionSnapshot>>(
    `/api/collaboration/code/${encodeURIComponent(code)}`,
  );

  return response.data;
}

export async function joinCollaborationSession(code: string) {
  const response = await apiClient<SuccessEnvelope<CollaborationSessionSnapshot>>(
    `/api/collaboration/code/${encodeURIComponent(code)}/join`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `collaboration-join-${code}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function startCollaborationSession(sessionId: number) {
  const response = await apiClient<SuccessEnvelope<CollaborationStartResult>>(
    `/api/collaboration/sessions/${sessionId}/start`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `collaboration-start-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function leaveCollaborationSession(sessionId: number) {
  const response = await apiClient<SuccessEnvelope<CollaborationSessionSnapshot>>(
    `/api/collaboration/sessions/${sessionId}/leave`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `collaboration-leave-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function cancelCollaborationSession(sessionId: number) {
  const response = await apiClient<SuccessEnvelope<CollaborationSessionSnapshot>>(
    `/api/collaboration/sessions/${sessionId}/cancel`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `collaboration-cancel-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}

export async function updateCollaborationSessionName(
  sessionId: number,
  customName: string | null,
) {
  const response = await apiClient<SuccessEnvelope<CollaborationSessionSnapshot>>(
    `/api/collaboration/sessions/${sessionId}/name`,
    {
      method: "PATCH",
      body: JSON.stringify({ customName }),
      headers: {
        "idempotency-key": `collaboration-name-${sessionId}-${Date.now()}`,
      },
    },
  );

  return response.data;
}
