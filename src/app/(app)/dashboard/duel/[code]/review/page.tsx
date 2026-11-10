import { DuelReviewPage } from "@/features/duel/review/duel-review";

type Props = { params: Promise<{ code: string }> };

export const metadata = {
  title: "Review answers | StudyBond",
  description: "Your answers and your rival's, question by question.",
};

export default async function DuelReviewRoute({ params }: Props) {
  const { code } = await params;
  return <DuelReviewPage code={code} />;
}
