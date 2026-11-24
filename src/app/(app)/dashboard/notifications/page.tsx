import type { Metadata } from "next";
import { Suspense } from "react";

import { NotificationsPage } from "@/features/notifications/notifications-page";

export const metadata: Metadata = {
  title: "Notifications | StudyBond",
};

export default function DashboardNotificationsPage() {
  return (
    <Suspense>
      <NotificationsPage />
    </Suspense>
  );
}
