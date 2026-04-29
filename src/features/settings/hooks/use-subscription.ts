import { useMutation } from "@tanstack/react-query";
import { initiateSubscription, verifySubscription } from "@/lib/api/subscriptions";
import type { InitiateSubscriptionPayload, VerifySubscriptionPayload } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

export function useInitiateSubscription() {
  return useMutation({
    mutationFn: (payload: InitiateSubscriptionPayload) => initiateSubscription(payload),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Failed to initiate subscription.";
      toast.error("Checkout Failed", { description: message });
    },
  });
}

export function useVerifySubscription() {
  return useMutation({
    mutationFn: (payload: VerifySubscriptionPayload) => verifySubscription(payload),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Failed to verify subscription.";
      toast.error("Verification Failed", { description: message });
    },
  });
}
