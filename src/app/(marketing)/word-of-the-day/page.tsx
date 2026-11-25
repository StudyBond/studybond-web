import type { Metadata } from "next";
import { cookies } from "next/headers";

import { WordDayView } from "@/features/words/components/word-day-view";
import { KIND_OF_THE_DAY } from "@/features/words/lib/words";
import { fetchWordArchive, fetchWordDay } from "@/features/words/server";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";
import { getPublicAppUrl } from "@/lib/env/server";

type Props = { searchParams: Promise<{ before?: string }> };

/* A new day starts at midnight Lagos time, so the page is built per request. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { before } = await searchParams;
  const day = await fetchWordDay();
  const appUrl = getPublicAppUrl();
  const main = day?.word ?? day?.idiom ?? day?.phrasalVerb ?? null;
  const url = `${appUrl}/word-of-the-day`;
  if (!day || !main) {
    const description = "A word, an idiom and a phrasal verb a day, from real JAMB English past questions.";
    return {
      title: "Word of the Day",
      description,
      alternates: { canonical: url },
      robots: { index: false, follow: true },
      openGraph: { title: "Word of the Day", description, url, siteName: "StudyBond", locale: "en_NG", type: "website", images: [{ url: "/api/og", width: 1200, height: 630, alt: "StudyBond" }] },
    };
  }
  const title = `Word of the Day: ${main.headword}`;
  // Short, so WhatsApp shows it whole under the title. The meaning is on the picture.
  const year = main.cameOut.years[0];
  const paper = `${main.cameOut.board ?? "JAMB"}${year ? ` ${year}` : ""}`;
  const description = `See what it means, then try the real ${paper} question. Plus an idiom and a phrasal verb. Free.`;
  // The date makes a new picture each day, so no cache shows yesterday's word.
  const image = `/api/og/word?date=${day.date}`;
  const alt = `${KIND_OF_THE_DAY[main.kind]}: ${main.headword}`;
  return {
    // The root layout adds " — StudyBond".
    title,
    description,
    alternates: { canonical: url },
    // Older pages stay out of search results.
    robots: before ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, siteName: "StudyBond", locale: "en_NG", type: "website", images: [{ url: image, width: 1200, height: 630, alt }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function WordOfTheDayPage({ searchParams }: Props) {
  const { before } = await searchParams;
  const olderOnly = before && /^\d{4}-\d{2}-\d{2}$/.test(before) ? before : undefined;
  const [day, archive, jar] = await Promise.all([fetchWordDay(), fetchWordArchive(olderOnly), cookies()]);
  const signedIn = jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE);
  return <WordDayView day={day} archive={archive} signedIn={signedIn} before={olderOnly} />;
}
