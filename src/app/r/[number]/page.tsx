import type { Metadata } from "next";

import { ResultCheck } from "@/features/duel/share/pages/result-check";
import { cleanNumber, fetchShareCard } from "@/features/duel/share/server";

type Props = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const card = await fetchShareCard(number);
  if (!card) return { title: "Result | StudyBond", robots: { index: false } };
  const image = `/api/og/result/${card.number}?shape=link`;
  return {
    title: `${card.previewTitle} | StudyBond`,
    description: card.previewText,
    robots: { index: false },
    openGraph: {
      title: card.previewTitle,
      description: card.previewText,
      url: `/r/${card.number}`,
      images: [{ url: image, width: 1200, height: 630, alt: card.previewTitle }],
    },
    twitter: { card: "summary_large_image", title: card.previewTitle, description: card.previewText, images: [image] },
  };
}

/** studybond.app/r/<number>: anyone can check a shared result. */
export default async function ResultCheckPage({ params }: Props) {
  const { number } = await params;
  const card = cleanNumber(number).length === 6 ? await fetchShareCard(number) : null;
  return <ResultCheck card={card} />;
}
