import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { faqJsonLd } from "@/lib/seo/json-ld";
import { getPremiumPlans } from "@/lib/premium/get-premium-plans";
import { LandingPage } from "@/features/landing/landing-page";
import { LANDING_FAQ, faqPlainText } from "@/features/landing/faq";

/* Shows each exam's admin-set premium price. Rebuilt when an admin saves a
   price, and at least hourly (see getPremiumPlans). */
export const revalidate = 3600;

const TITLE = "StudyBond — JAMB UTME & UI Post-UTME Past Questions and CBT Practice";
const DESCRIPTION =
  "Real JAMB UTME and UI Post-UTME past questions in timed CBT practice, each exam kept on its own. Every answer explained, live duels with other students, free to start.";
/* Shorter, for link previews: WhatsApp shows about two lines of each. */
const SHARE_TITLE = "StudyBond: JAMB and UI Post-UTME past questions";
const SHARE_TEXT = "Real past questions, timed like the real CBT. Every answer explained, live duels with friends. Free to start.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  // A page's openGraph replaces the root one whole, so the picture and site tags are repeated here.
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_TEXT,
    url: "/",
    siteName: "StudyBond",
    locale: "en_NG",
    type: "website",
    images: [{ url: "/api/og/home", width: 1200, height: 630, alt: "StudyBond — JAMB UTME and UI Post-UTME CBT practice" }],
  },
  twitter: { card: "summary_large_image", title: SHARE_TITLE, description: SHARE_TEXT, images: ["/api/og/home"] },
};

export default async function HomePage() {
  const plans = await getPremiumPlans();

  return (
    <>
      <JsonLdScript
        data={faqJsonLd(LANDING_FAQ.map((item) => ({ question: item.question, answer: faqPlainText(item) })))}
      />
      <LandingPage plans={plans} />
    </>
  );
}
