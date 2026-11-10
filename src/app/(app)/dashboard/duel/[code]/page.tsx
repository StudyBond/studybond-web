import { Suspense } from "react";

import { DuelRoomPage } from "@/features/duel/room/duel-room";

type DuelRoomRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function generateMetadata({ params }: DuelRoomRouteProps) {
  const { code } = await params;

  return {
    title: `Duel ${code.toUpperCase()} | StudyBond`,
    description: "Your duel slip and the face-off.",
  };
}

export default async function DuelRoomRoute({ params }: DuelRoomRouteProps) {
  const { code } = await params;

  return (
    <Suspense>
      <DuelRoomPage code={code} />
    </Suspense>
  );
}
