import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

import type { AttemptBody, MyCard, MyWordDay, ReviewResult, WordBook } from "./types";

/* Signed-in calls, through the web's /api proxy (app/api/word-of-the-day,
   app/api/word-book), which adds the student's session. */

export async function getMyWordDay() {
  const response = await apiClient<SuccessEnvelope<MyWordDay>>("/api/word-of-the-day/me");
  return response.data;
}

/** Write-once per step: the stress tap, "I knew it / Not yet", the real question. */
export async function sendWordAttempt(body: AttemptBody) {
  const response = await apiClient<SuccessEnvelope<MyCard>>("/api/word-of-the-day/me/attempt", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function getWordBook() {
  const response = await apiClient<SuccessEnvelope<WordBook>>("/api/word-book");
  return response.data;
}

export async function sendWordReview(body: { cardId: number; choiceId: number }) {
  const response = await apiClient<SuccessEnvelope<ReviewResult>>("/api/word-book/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export const wordKeys = {
  myDay: ["words", "me"] as const,
  book: ["words", "book"] as const,
};
