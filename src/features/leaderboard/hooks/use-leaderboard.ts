import { useQuery } from "@tanstack/react-query";
import { getWeeklyLeaderboard, getMyRank } from "@/lib/api/leaderboard";

export function useWeeklyLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ["leaderboard", "weekly", limit],
    queryFn: () => getWeeklyLeaderboard(limit),
  });
}

export function useMyRank() {
  return useQuery({
    queryKey: ["leaderboard", "my-rank"],
    queryFn: getMyRank,
  });
}
