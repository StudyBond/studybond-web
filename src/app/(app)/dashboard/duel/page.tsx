import { DuelClient } from "@/features/duel/components/duel-client";

export const metadata = {
  title: "Duel | StudyBond",
  description: "Challenge someone to a 1v1 duel on the same paper, same clock.",
};

export default function DuelDashboardPage() {
  return <DuelClient />;
}
