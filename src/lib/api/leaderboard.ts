import { apiClient } from "@/lib/api/client";
import type { Leaderboard, MyRank, SuccessEnvelope } from "@/lib/api/types";

export async function getMyRank() {
  const response = await apiClient<SuccessEnvelope<MyRank>>("/api/leaderboard/my-rank");
  return response.data;
}

export async function getWeeklyLeaderboard(limit = 10) {
  const response = await apiClient<SuccessEnvelope<Leaderboard>>(
    `/api/leaderboard/weekly?limit=${limit}`,
  );
  return response.data;
}
