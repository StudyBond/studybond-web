import "server-only";

import { getBackendApiBaseUrl } from "@/lib/env/server";
import {
  FALLBACK_PREMIUM_PLANS,
  PREMIUM_PLANS_TAG,
  type BoardPremiumPlan,
} from "./plans";

/** Pages refresh on their own this often, in case the admin's "rebuild"
 *  message never arrives. */
export const PREMIUM_PLANS_REVALIDATE_SECONDS = 3600;

type BoardRow = {
  code?: unknown;
  name?: unknown;
  examName?: unknown;
  status?: unknown;
  premium?: { priceNaira?: unknown; durationMonths?: unknown };
};

function toPlan(row: BoardRow): BoardPremiumPlan | null {
  const price = row.premium?.priceNaira;
  const months = row.premium?.durationMonths;
  if (
    typeof row.code !== "string" ||
    typeof price !== "number" || !(price > 0) ||
    typeof months !== "number" || !(months > 0)
  ) {
    return null;
  }
  return {
    code: row.code,
    name: typeof row.name === "string" ? row.name : row.code,
    examName: typeof row.examName === "string" ? row.examName : "",
    status: row.status === "OPEN" ? "OPEN" : "COMING_SOON",
    priceNaira: price,
    durationMonths: months,
  };
}

/**
 * Every board's premium price, from the backend's public board list.
 *
 * The page that calls this is built once and kept (ISR). It is rebuilt
 * when an admin saves a price, and at least hourly.
 *
 * If the backend cannot be reached:
 * - while the site is being built (or in dev): use the last-known copy in
 *   plans.fallback.json, so a build never fails over it;
 * - on a later rebuild: throw. Next.js then keeps serving the last page it
 *   built, with the last price it saw, and tries again on the next visit.
 */
export async function getPremiumPlans(): Promise<BoardPremiumPlan[]> {
  try {
    const response = await fetch(`${getBackendApiBaseUrl()}/api/institutions`, {
      next: { revalidate: PREMIUM_PLANS_REVALIDATE_SECONDS, tags: [PREMIUM_PLANS_TAG] },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Board list answered ${response.status}`);

    const json = (await response.json()) as { data?: { boards?: BoardRow[] } };
    const plans = (json.data?.boards ?? []).map(toPlan).filter((plan): plan is BoardPremiumPlan => plan !== null);
    if (plans.length === 0) throw new Error("Board list had no premium prices");
    return plans;
  } catch (error) {
    const building = process.env.NEXT_PHASE === "phase-production-build";
    if (building || process.env.NODE_ENV !== "production") {
      console.warn(
        `[premium-plans] Using the last-known prices: ${(error as Error)?.message ?? error}`,
      );
      return FALLBACK_PREMIUM_PLANS;
    }
    throw error;
  }
}
