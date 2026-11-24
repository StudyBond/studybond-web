import fallback from "./plans.fallback.json";

/* Premium is priced per board in the admin. Nothing in the web hardcodes a
   price: public pages bake in the server's price when they are built, and
   checkout always charges whatever the server says when it opens. */

/** Cache tag for every page that shows a premium price. The backend asks
 *  /api/revalidate to refresh it when an admin saves a price. Keep in step
 *  with studybond-backend src/shared/web/revalidate-web.ts. */
export const PREMIUM_PLANS_TAG = "premium-plans";

export type PremiumPlan = {
  priceNaira: number;
  durationMonths: number;
};

export type BoardPremiumPlan = PremiumPlan & {
  code: string;
  name: string;
  examName: string;
  status: "OPEN" | "COMING_SOON";
};

/** The copy used when the backend cannot be reached at build time. */
export const FALLBACK_PREMIUM_PLANS: BoardPremiumPlan[] = fallback.boards as BoardPremiumPlan[];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatPlanLength(months: number): string {
  return `${months} month${months === 1 ? "" : "s"}`;
}

/** "₦5,000 for 5 months" */
export function describePlan(plan: PremiumPlan): string {
  return `${formatNaira(plan.priceNaira)} for ${formatPlanLength(plan.durationMonths)}`;
}

/** One board's plan, falling back to the last-known copy, then to any board. */
export function planForBoard(plans: BoardPremiumPlan[], code: string): BoardPremiumPlan {
  return (
    plans.find((plan) => plan.code === code) ??
    FALLBACK_PREMIUM_PLANS.find((plan) => plan.code === code) ??
    plans[0] ??
    FALLBACK_PREMIUM_PLANS[0]
  );
}

/** "UI Post-UTME", "JAMB UTME": short enough for a price line. */
export function boardShortLabel(plan: BoardPremiumPlan): string {
  return plan.examName && !plan.code.toUpperCase().includes(plan.examName.toUpperCase())
    ? `${plan.code} ${plan.examName}`
    : plan.code;
}

export type HomePricing = {
  /** The price in big type. With several prices, the lowest. */
  headline: PremiumPlan;
  /** True when open boards cost different amounts ("from ₦X"). */
  varies: boolean;
  /** One line per open board, shown only when prices differ. */
  perBoard: { label: string; text: string }[];
};

/**
 * What the home page pricing card shows. Only boards students can buy
 * (OPEN) count. If they all cost the same, one price; otherwise "from" the
 * cheapest, with each board's price listed under it.
 */
export function homePricing(plans: BoardPremiumPlan[]): HomePricing {
  const open = plans.filter((plan) => plan.status === "OPEN");
  const list = open.length > 0 ? open : plans.length > 0 ? plans : FALLBACK_PREMIUM_PLANS;

  const cheapest = list.reduce((low, plan) => (plan.priceNaira < low.priceNaira ? plan : low), list[0]);
  const varies = list.some(
    (plan) => plan.priceNaira !== cheapest.priceNaira || plan.durationMonths !== cheapest.durationMonths,
  );

  return {
    headline: { priceNaira: cheapest.priceNaira, durationMonths: cheapest.durationMonths },
    varies,
    perBoard: varies
      ? list.map((plan) => ({ label: boardShortLabel(plan), text: describePlan(plan) }))
      : [],
  };
}
