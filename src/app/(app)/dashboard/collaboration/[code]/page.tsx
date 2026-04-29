import { CollaborationRoomClient } from "@/features/collaboration/components/collaboration-room-client";

type CollaborationRoomRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function generateMetadata({ params }: CollaborationRoomRouteProps) {
  const { code } = await params;

  return {
    title: `Room ${code.toUpperCase()} | StudyBond`,
    description: "StudyBond collaboration room lobby and live duel handoff.",
  };
}

export default async function CollaborationRoomRoute({
  params,
}: CollaborationRoomRouteProps) {
  const { code } = await params;

  return <CollaborationRoomClient code={code} />;
}
