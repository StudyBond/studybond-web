import { DuelRoomClient } from "@/features/duel/components/duel-room-client";

type DuelRoomRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function generateMetadata({ params }: DuelRoomRouteProps) {
  const { code } = await params;

  return {
    title: `Duel ${code.toUpperCase()} | StudyBond`,
    description: "Duel lobby — ready up and start.",
  };
}

export default async function DuelRoomRoute({
  params,
}: DuelRoomRouteProps) {
  const { code } = await params;

  return <DuelRoomClient code={code} />;
}
