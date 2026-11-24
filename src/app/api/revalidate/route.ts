import { timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { PREMIUM_PLANS_TAG } from "@/lib/premium/plans";

/* The backend calls this when an admin saves something public pages show
   (a board's premium price, name or status). Only known tags are accepted,
   and only with the shared secret. */

const ALLOWED_TAGS = new Set<string>([PREMIUM_PLANS_TAG]);

function secretMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) {
    return Response.json({ revalidated: false, message: "Not set up." }, { status: 503 });
  }

  if (!secretMatches(request.headers.get("x-revalidate-secret") ?? "", expected)) {
    return Response.json({ revalidated: false, message: "Not allowed." }, { status: 401 });
  }

  let tags: unknown;
  try {
    tags = ((await request.json()) as { tags?: unknown }).tags;
  } catch {
    tags = undefined;
  }

  const wanted = Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : [];
  const accepted = wanted.filter((tag) => ALLOWED_TAGS.has(tag));
  if (accepted.length === 0) {
    return Response.json({ revalidated: false, message: "No known tags." }, { status: 400 });
  }

  /* "max": the pages are marked stale. The next visit gets the old page
     once while the new one builds; if that build fails (backend down), the
     old page simply stays. Never an error page. */
  for (const tag of accepted) {
    revalidateTag(tag, "max");
  }

  return Response.json({ revalidated: accepted, now: Date.now() });
}
