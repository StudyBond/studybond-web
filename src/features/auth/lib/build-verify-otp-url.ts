import type { AuthChallenge } from "@/lib/api/types";
import type { Route } from "next";

export function buildVerifyOtpUrl(email: string, challenge: AuthChallenge) {
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

  return `/verify-otp?${params.toString()}` as Route;
}
