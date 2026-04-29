import { apiClient } from "@/lib/api/client";
import type {
  AuthChallenge,
  AuthMe,
  AuthMessage,
  AuthSuccess,
  ForgotPasswordPayload,
  LoginPayload,
  SignupPayload,
  ResetPasswordPayload,
  VerificationResendResponse,
  VerifyOtpPayload,
} from "@/lib/api/types";

export type AuthResponse = AuthSuccess | AuthChallenge;

export function login(payload: LoginPayload) {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload: SignupPayload) {
  return apiClient<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyOtp(payload: VerifyOtpPayload) {
  return apiClient<AuthResponse>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendVerificationOtp(payload: ForgotPasswordPayload) {
  return apiClient<VerificationResendResponse>(
    "/api/auth/resend-verification-otp",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient<AuthMessage>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiClient<AuthMessage>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return apiClient<AuthMe>("/api/auth/me");
}

export function logout() {
  return apiClient<AuthMessage>("/api/auth/logout", {
    method: "POST",
  });
}
