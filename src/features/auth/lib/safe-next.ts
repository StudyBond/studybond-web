import type { Route } from "next";

/**
 * Where to go after logging in or signing up, from a `?next=` link (an invited
 * friend coming back to the duel they were sent). Only paths on this site:
 * anything else, including "//evil.com", falls back to the dashboard.
 */
export function safeNext(raw: string | null | undefined, fallback = "/dashboard"): Route {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback as Route;
  return raw as Route;
}
