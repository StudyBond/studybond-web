import { CollaborationClient } from "@/features/collaboration/components/collaboration-client";

export const metadata = {
  title: "Collaboration | StudyBond",
  description: "Create, join, and launch premium 1v1 collaboration exams.",
};

export default function CollaborationDashboardPage() {
  return <CollaborationClient />;
}
