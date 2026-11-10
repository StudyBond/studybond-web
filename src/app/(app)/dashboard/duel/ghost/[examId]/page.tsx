import { notFound } from "next/navigation";

import { GhostResultPage } from "@/features/duel/ghost/ghost-result";

type Props = { params: Promise<{ examId: string }> };

export const metadata = {
  title: "Ghost race result | StudyBond",
};

export default async function GhostResultRoute({ params }: Props) {
  const { examId } = await params;
  const id = Number(examId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <GhostResultPage examId={id} />;
}
