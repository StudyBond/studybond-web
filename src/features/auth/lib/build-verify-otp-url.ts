import type { AuthChallenge } from "@/lib/api/types";
import type { Route } from "next";

export function buildVerifyOtpUrl(email: string, challenge: AuthChallenge, next?: string | null) {
  const params = new URLSearchParams({
    email,
    verificationType: challenge.verificationType,
  });

  if (challenge.otpExpiresAt) {
    params.set("otpExpiresAt", challenge.otpExpiresAt);
  }

  if (challenge.resendAvailableAt) {
    params.set("resendAvailableAt", challenge.resendAvailableAt);
  }

  // Carried through so the code screen sends them on to the same place.
  if (next) {
    params.set("next", next);
  }

  return `/verify-otp?${params.toString()}` as Route;
}
