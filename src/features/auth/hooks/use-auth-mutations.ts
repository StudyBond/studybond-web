"use client";

import {
  forgotPassword,
  login,
  logout,
  signup,
  resendVerificationOtp,
  resetPassword,
  verifyOtp,
} from "@/lib/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: signup,
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useResendVerificationOtpMutation() {
  return useMutation({
    mutationFn: resendVerificationOtp,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
