import { apiClient } from "@/lib/api/client";
import type { StreakCalendar, StreakSummary, SuccessEnvelope } from "@/lib/api/types";

export async function getStreakSummary() {
  const response = await apiClient<SuccessEnvelope<StreakSummary>>("/api/streaks");
  return response.data;
}

export async function getStreakCalendar(days = 30) {
  const response = await apiClient<SuccessEnvelope<StreakCalendar>>(
    `/api/streaks/calendar?days=${days}`,
  );
  return response.data;
}
