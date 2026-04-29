import { apiClient } from "@/lib/api/client";
import type {
  InitiateSubscriptionPayload,
  InitiateSubscriptionResponse,
  SubscriptionStatus,
  SuccessEnvelope,
  VerifySubscriptionPayload,
  VerifySubscriptionResponse,
} from "@/lib/api/types";

export async function getSubscriptionStatus() {
  const response = await apiClient<SuccessEnvelope<SubscriptionStatus>>(
    "/api/subscriptions/status",
  );
  return response.data;
}

export async function initiateSubscription(payload: InitiateSubscriptionPayload) {
  const response = await apiClient<SuccessEnvelope<InitiateSubscriptionResponse>>(
    "/api/subscriptions/initiate",
    {
      method: "POST",
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

export async function verifySubscription(payload: VerifySubscriptionPayload) {
  const response = await apiClient<SuccessEnvelope<VerifySubscriptionResponse>>(
    "/api/subscriptions/verify",
    {
      method: "POST",
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}
