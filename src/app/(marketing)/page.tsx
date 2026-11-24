import { MarketingClient } from "./marketing-client";
import { LeaderboardCard } from "@/components/marketing/leaderboard-card";
import { StreakCard } from "@/components/marketing/streak-card";
import { AnalyticsDashboardMock } from "@/components/marketing/analytics-dashboard-mock";
import { DuelCard } from "@/components/marketing/duel-card";
import { features, faq, pricingFree, pricingPremium } from "./constants";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { faqJsonLd } from "@/lib/seo/json-ld";
import { getPremiumPlans } from "@/lib/premium/get-premium-plans";
import { homePricing } from "@/lib/premium/plans";

/* Shows the admin-set premium price. Rebuilt when an admin saves a price,
   and at least hourly (see getPremiumPlans). */
export const revalidate = 3600;

/* ── Homepage component ── */
export default async function MarketingPage() {
  const premiumPricing = homePricing(await getPremiumPlans());

  return (
    <main className="overflow-x-hidden">
      <JsonLdScript data={faqJsonLd(faq)} />

      <MarketingClient
        leaderboardCard={<LeaderboardCard />}
        streakCard={<StreakCard />}
        scoreCard={<AnalyticsDashboardMock />}
        duelCard={<DuelCard />}
        features={features}
        faq={faq}
        pricingFree={pricingFree}
        pricingPremium={pricingPremium}
        premiumPricing={premiumPricing}
      />
    </main>
  );
}
