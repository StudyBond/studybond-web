import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { WordPageView } from "@/features/words/components/word-page-view";
import { clip, KIND_LABEL } from "@/features/words/lib/words";
import { fetchWordPage } from "@/features/words/server";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";
import { getPublicAppUrl } from "@/lib/env/server";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchWordPage(slug);
  if (!page) return { title: "Word of the Day", robots: { index: false } };
  const card = page.card;
  const appUrl = getPublicAppUrl();
  const url = `${appUrl}/word-of-the-day/${card.slug}`;
  const years = card.cameOut.years;
  const came = years.length ? ` It came out in JAMB ${years.join(" and ")}.` : "";
  const title = `${card.headword}: meaning and JAMB question`;
  const description = `${card.headword} (${(card.partOfSpeech ?? KIND_LABEL[card.kind]).toLowerCase()}): ${clip(card.meaning, 110)}${came}`;
  const image = `/api/og/word/${card.slug}`;
  return {
    // The root layout adds " — StudyBond".
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "StudyBond", locale: "en_NG", type: "article", images: [{ url: image, width: 1200, height: 630, alt: `${card.headword}, ${KIND_LABEL[card.kind].toLowerCase()}` }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function WordCardPage({ params }: Props) {
  const { slug } = await params;
  const [page, jar] = await Promise.all([fetchWordPage(slug), cookies()]);
  if (!page) notFound();
  const signedIn = jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE);
  return <WordPageView page={page} signedIn={signedIn} />;
}
