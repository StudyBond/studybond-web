import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { homeKeys } from "@/features/home/api";
import { ApiError } from "@/lib/api/errors";
import { initiateSubscription, verifySubscription } from "@/lib/api/subscriptions";
import type { InitiateSubscriptionPayload, VerifySubscriptionPayload } from "@/lib/api/types";

export const PAYMENT_SUPPORT_EMAIL = "studybondapp@gmail.com";

export function useInitiateSubscription() {
  return useMutation({
    mutationFn: (payload: InitiateSubscriptionPayload) => initiateSubscription(payload),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Please try again in a minute.";
      toast.error("Checkout couldn't start", { description: message });
    },
  });
}

export function useVerifySubscription() {
  return useMutation({
    mutationFn: (payload: VerifySubscriptionPayload) => verifySubscription(payload),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : `If money left your account, email ${PAYMENT_SUPPORT_EMAIL}.`;
      toast.error("We couldn't confirm the payment", { description: message });
    },
  });
}

/** Re-reads everything that shows the plan, after a payment. */
export function useRefreshPremium() {
  const qc = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: homeKeys.home }),
      qc.invalidateQueries({ queryKey: ["home", "community"] }),
      qc.invalidateQueries({ queryKey: ["settings", "subscription-status"] }),
      qc.invalidateQueries({ queryKey: ["dashboard", "subscription-status"] }),
      qc.invalidateQueries({ queryKey: ["dashboard", "profile"] }),
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] }),
      qc.invalidateQueries({ queryKey: ["user-profile"] }),
      qc.invalidateQueries({ queryKey: ["auth", "me"] }),
    ]);
  }, [qc]);
}
