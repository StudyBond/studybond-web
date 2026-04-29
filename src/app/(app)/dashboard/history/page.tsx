import { HistoryPageClient } from "@/features/history/components/history-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam History | StudyBond",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
