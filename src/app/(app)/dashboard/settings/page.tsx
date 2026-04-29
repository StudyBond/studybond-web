import { SettingsPageClient } from "@/features/settings/components/settings-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | StudyBond",
};

export default function DashboardSettingsPage() {
  return <SettingsPageClient />;
}
