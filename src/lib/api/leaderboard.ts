import { apiClient } from "@/lib/api/client";
import type { Leaderboard, MyRank, SuccessEnvelope } from "@/lib/api/types";
import type { AvatarView } from "@/features/avatar/avatar-look";

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

// ─── The new leaderboard screen (GET /api/leaderboard/board) ───

export type BoardType = "WEEKLY" | "ALL_TIME";
export type BoardScope = "board" | "group";

export type BoardEntry = {
  rank: number;
  userId: number;
  /** "Adaeze O." The server never sends other students' full names here. */
  displayName: string;
  subtitle: string | null;
  points: number;
  weeklySp: number;
  totalSp: number;
  /** Places moved since the start of today (+ up); null when unknown. */
  movement: number | null;
  avatar: AvatarView;
  isCurrentUser: boolean;
};

export type BoardWeek = { weekStartDate: string; weekEndDate: string; endsAt: string };

export type LeaderboardBoard = {
  type: BoardType;
  scope: BoardScope;
  institution: { id: number; code: string; name: string; slug: string };
  generatedAt: string;
  week: BoardWeek | null;
  group: { kind: "COURSE" | "DEPARTMENT"; value: string | null; label: string | null } | null;
  totalParticipants: number;
  meritList: { size: number; cutoffPoints: number | null; cutoffHolder: BoardEntry | null };
  entries: BoardEntry[];
  me: { rank: number | null; points: number; movement: number | null; entry: BoardEntry | null };
  ladder: { above: BoardEntry | null; below: BoardEntry | null };
  lastWeek: {
    week: BoardWeek;
    entries: BoardEntry[];
    cutoffPoints: number | null;
    totalParticipants: number;
    myRank: number | null;
  } | null;
  myBest: { rank: number; weekStartDate: string } | null;
  /** Your duel record with the students in this reply; a student missing from
   *  it never duelled you. The whole field is missing on servers older than
   *  backend ff7aaf9: then say nothing about duels rather than "never". */
  headToHead?: BoardHeadToHead[];
};

export type BoardHeadToHead = {
  userId: number;
  wins: number;
  losses: number;
  draws: number;
  /** Your most recent duel with them, your marks first. */
  lastDuel: { result: "W" | "L" | "D"; myScore: number; opponentScore: number } | null;
  /** An open direct challenge between you. FROM_THEM waits on your Duel page. */
  challenge: "FROM_THEM" | "FROM_YOU" | null;
};

export async function getLeaderboardBoard(type: BoardType, scope: BoardScope, limit = 20) {
  const response = await apiClient<SuccessEnvelope<LeaderboardBoard>>(
    `/api/leaderboard/board?type=${type}&scope=${scope}&limit=${limit}`,
  );
  return response.data;
}
