import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DailyLanding } from "@/features/duel/share/pages/daily-landing";
import { boardLabelOf, cleanChallengeName, fetchDailyLink } from "@/features/duel/share/server";
import { dailyOpenPreview } from "@/features/duel/share/types";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const daily = await fetchDailyLink(name);
  if (!daily) return { title: "Daily Challenge", robots: { index: false } };
  const card = daily.card;
  const open = dailyOpenPreview(daily.link.firstName);
  const title = card ? card.previewTitle : open.title;
  const description = card ? card.previewText : open.text;
  // The shared result's picture; with none shared yet, a Daily Challenge slip with the owner on it.
  const image = card ? `/api/og/result/${card.number}?shape=link` : `/api/og/daily/${daily.link.name}`;
  return {
    // The root layout adds " — StudyBond".
    title,
    description,
    robots: { index: false },
    openGraph: {
      title,
      description,
      url: `/daily/${daily.link.name}`,
      siteName: "StudyBond",
      locale: "en_NG",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/**
 * studybond.app/daily/<name>, printed on Daily Challenge cards. Visitors see
 * the landing; signed-in students go on to today's challenge, or to both
 * results side by side if they have taken it.
 */
export default async function DailyLinkPage({ params }: Props) {
  const { name } = await params;
  const clean = cleanChallengeName(name);
  const jar = await cookies();
  if (jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE)) {
    redirect(`/daily/${encodeURIComponent(clean)}/go` as Route);
  }
  const daily = await fetchDailyLink(clean);
  // The board the shared daily was taken on; with none shared, the student's own.
  const board = daily?.card?.boardLine || boardLabelOf(daily?.link.board ?? null);
  return <DailyLanding daily={daily} board={board} />;
}
