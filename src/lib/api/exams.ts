import { apiClient } from "@/lib/api/client";
import type {
  ExamSessionData,
  ExamResult,
  ExamHistory,
  ExamAbandonResult,
  SubmitExamPayload,
  SuccessEnvelope,
} from "@/lib/api/types";

// ─── Shared Enums ───

export type ExamType = "REAL_PAST_QUESTION" | "PRACTICE" | "MIXED" | "ONE_V_ONE_DUEL" | "GROUP_COLLAB" | "DAILY_CHALLENGE";
export type Subject = "Mathematics" | "English" | "Physics" | "Chemistry" | "Biology";

// ─── Payloads ───

export interface StartExamPayload {
  institutionCode?: string;
  examType?: ExamType;
  subjects: Subject[];
}

export interface StartDailyChallengePayload {
  subjects: Subject[];
}

export interface ExamEligibilityResult {
  canTakeExam: boolean;
  reason?: string;
  errorCode?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  requestedCredits?: number;
  freeSubjectsTaken?: string[];
}

// ─── API Functions ───

/** Check user's exam limits and credits. */
export async function getExamEligibility() {
  const response = await apiClient<SuccessEnvelope<ExamEligibilityResult>>(
    "/api/exams/eligibility",
  );
  return response.data;
}

/** Start a new exam session — returns the full question set + timing. */
export async function startExam(payload: StartExamPayload) {
  const response = await apiClient<SuccessEnvelope<ExamSessionData>>(
    "/api/exams/start",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Start a global daily challenge. */
export async function startDailyChallenge(payload: StartDailyChallengePayload) {
  const response = await apiClient<SuccessEnvelope<ExamSessionData>>(
    "/api/exams/daily-challenge/start",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Get questions for an in-progress exam (resume after page refresh). */
export async function getExamQuestions(examId: number) {
  const response = await apiClient<SuccessEnvelope<ExamSessionData>>(
    `/api/exams/${examId}/questions`,
  );
  return response.data;
}

/** Submit exam answers and receive scored results. */
export async function submitExam(examId: number, payload: SubmitExamPayload) {
  const response = await apiClient<SuccessEnvelope<ExamResult>>(
    `/api/exams/${examId}/submit`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "idempotency-key": `exam-submit-${examId}-${Date.now()}`,
      },
    },
  );
  return response.data;
}

/** Abandon an in-progress exam. No SP earned. */
export async function abandonExam(examId: number) {
  const response = await apiClient<SuccessEnvelope<ExamAbandonResult>>(
    `/api/exams/${examId}/abandon`,
    {
      method: "POST",
    },
  );
  return response.data;
}

/** Get paginated exam history with optional filters. */
export async function getExamHistory(params?: {
  page?: number;
  limit?: number;
  examType?: ExamType;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.examType) searchParams.set("examType", params.examType);
  if (params?.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  const response = await apiClient<SuccessEnvelope<ExamHistory>>(
    `/api/exams/history${query ? `?${query}` : ""}`,
  );
  return response.data;
}

/** Get full details for a completed exam (with answers + explanations). */
export async function getExamDetail(examId: number) {
  const response = await apiClient<SuccessEnvelope<ExamResult>>(
    `/api/exams/${examId}`,
  );
  return response.data;
}

/** Create a retake of a completed exam. */
export async function retakeExam(examId: number) {
  const response = await apiClient<SuccessEnvelope<ExamSessionData>>(
    `/api/exams/${examId}/retake`,
    {
      method: "POST",
      headers: {
        "idempotency-key": `exam-retake-${examId}-${Date.now()}`,
      },
    },
  );
  return response.data;
}

export async function reportExamViolation(
  examId: number,
  violationType: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean }> {
  const response = await apiClient<SuccessEnvelope<{ recorded: boolean }>>(
    `/api/exams/${examId}/violations`,
    {
      method: "POST",
      body: JSON.stringify({ violationType, metadata }),
    }
  );
  return { success: response.success };
}
