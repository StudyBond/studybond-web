/* Telling the student why they were signed out.

   When a premium account logs in on another device, the backend ends the
   old session and answers its next request with 401 SESSION_REPLACED. The
   API client calls announceSignedOut, and <SignedOutNotice> (mounted once in
   AppProviders) shows the notice over whatever page the student is on. */

export const SIGNED_OUT_EVENT = "studybond:signed-out";

export type SignedOutReason = "replaced";

export function signedOutReasonFromCode(code: unknown): SignedOutReason | null {
  return code === "SESSION_REPLACED" ? "replaced" : null;
}

export function announceSignedOut(reason: SignedOutReason) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ reason: SignedOutReason }>(SIGNED_OUT_EVENT, { detail: { reason } }));
}
