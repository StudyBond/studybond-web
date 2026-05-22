import { NotificationsPageClient } from "@/features/notifications/components/notifications-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | StudyBond",
};

export default function DashboardNotificationsPage() {
  return <NotificationsPageClient />;
}
