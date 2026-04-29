import { useQuery } from "@tanstack/react-query";
import { getExamDetail } from "@/lib/api/exams";

export function useExamDetail(examId: number) {
  return useQuery({
    queryKey: ["exam-detail", examId],
    queryFn: () => getExamDetail(examId),
    enabled: !!examId,
  });
}
