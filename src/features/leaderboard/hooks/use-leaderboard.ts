import { useQuery } from "@tanstack/react-query";
import {
  getLeaderboardBoard,
  getMyRank,
  getWeeklyLeaderboard,
  type BoardScope,
  type BoardType,
} from "@/lib/api/leaderboard";

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

/** The whole leaderboard screen for one tab. Kept fresh: it is a live race. */
export function useLeaderboardBoard(type: BoardType, scope: BoardScope) {
  return useQuery({
    queryKey: ["leaderboard", "board", type, scope],
    queryFn: () => getLeaderboardBoard(type, scope),
    staleTime: 20_000,
    refetchOnWindowFocus: true,
  });
}
