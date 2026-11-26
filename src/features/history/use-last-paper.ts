import { useQuery } from "@tanstack/react-query";

import { getExamHistory } from "@/lib/api/exams";

/**
 * How many papers a student has sent on this board, and the last one. Me,
 * Home and Practice use it for their links to Past papers. One small request,
 * shared; the "exam-history" prefix is refreshed after every paper.
 */
export function useLastPaper() {
  return useQuery({
    queryKey: ["exam-history", "last"],
    queryFn: () => getExamHistory({ page: 1, limit: 1, status: "COMPLETED" }),
    staleTime: 60_000,
    retry: 1,
    select: (d) => ({ total: d.pagination.total, last: d.exams[0] ?? null }),
  });
}
