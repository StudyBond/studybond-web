import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

import type { OwnerShare, ShareSettings } from "./types";

/** Give my result its public number (first time) and get the card. */
export async function shareResult(examId: number): Promise<OwnerShare> {
  const response = await apiClient<SuccessEnvelope<OwnerShare>>("/api/share/results", {
    method: "POST",
    body: JSON.stringify({ examId }),
  });
  return response.data;
}

/** Change my switches; the public page follows straight away. */
export async function updateShareSettings(number: string, settings: Partial<ShareSettings>): Promise<OwnerShare> {
  const response = await apiClient<SuccessEnvelope<OwnerShare>>(`/api/share/results/${number}`, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
  return response.data;
}
