import { useMutation } from "@tanstack/react-query";
import { createQuestionReport } from "@/lib/api/reports";
import type { CreateReportPayload } from "@/lib/api/types";

export function useReportQuestion() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => createQuestionReport(payload),
  });
}
