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

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { title: TITLE, description: DESCRIPTION },
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
