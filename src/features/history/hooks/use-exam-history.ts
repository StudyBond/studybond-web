import { useQuery } from "@tanstack/react-query";
import { getExamHistory } from "@/lib/api/exams";
import type { ExamType } from "@/lib/api/exams";

type UseExamHistoryParams = {
  page?: number;
  limit?: number;
  examType?: ExamType | "ALL";
  status?: string | "ALL";
};

export function useExamHistory(params?: UseExamHistoryParams) {
  return useQuery({
    queryKey: [
      "exam-history",
      params?.page,
      params?.limit,
      params?.examType,
      params?.status,
    ],
    queryFn: () =>
      getExamHistory({
        page: params?.page,
        limit: params?.limit,
        examType: params?.examType === "ALL" ? undefined : params?.examType,
        status: params?.status === "ALL" ? undefined : params?.status,
      }),
  });
}
