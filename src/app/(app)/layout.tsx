import type { Metadata } from "next";

import { DuelSearchDock } from "@/features/duel-matchmaking/components/duel-search-dock";
import { AlertsBridge } from "@/features/notifications/alerts-bridge";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      {/* "Find a challenger" follows the student across every page,
          including exams, where it stays hidden but keeps checking in. */}
      <DuelSearchDock />
      {/* Alerts: the service worker, in-page banners, taps on alerts. */}
      <AlertsBridge />
    </>
  );
}
