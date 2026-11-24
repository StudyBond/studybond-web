import { LeaderboardPageClient } from "@/features/leaderboard/components/leaderboard-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "League | StudyBond",
};

export default function LeaderboardPage() {
  return <LeaderboardPageClient />;
}
