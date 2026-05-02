import { apiClient } from "@/lib/api/client";
import type {
  CreateReportPayload,
  QuestionReport,
  SuccessEnvelope,
} from "@/lib/api/types";

/** Submit a question report. */
export async function createQuestionReport(payload: CreateReportPayload) {
  const response = await apiClient<SuccessEnvelope<QuestionReport>>(
    "/api/reports/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}
