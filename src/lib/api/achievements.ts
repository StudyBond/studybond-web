import { apiClient } from "@/lib/api/client";
import type { Achievement, SuccessEnvelope } from "@/lib/api/types";

export async function getAchievements() {
  const response = await apiClient<SuccessEnvelope<Achievement[]>>(
    "/api/users/achievements",
  );
  return response.data;
}
