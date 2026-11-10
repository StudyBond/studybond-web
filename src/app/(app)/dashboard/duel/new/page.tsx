import { Suspense } from "react";

import { DuelSetupPage } from "@/features/duel/setup/duel-setup";

export const metadata = {
  title: "Challenge a friend | StudyBond",
  description: "Make a duel slip and send it to a friend.",
};

export default function DuelNewPage() {
  return (
    <Suspense>
      <DuelSetupPage />
    </Suspense>
  );
}
