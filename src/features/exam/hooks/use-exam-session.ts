import { useQuery } from "@tanstack/react-query";
import { getExamQuestions } from "@/lib/api/exams";
import { offlineStore } from "@/features/exam/stores/offline-store";

/** Fetch exam session data (questions + timing) for an active exam. */
export function useExamSession(examId: number | null) {
  return useQuery({
    queryKey: ["exam-session", examId],
    queryFn: async () => {
      try {
        // 1. Try to fetch fresh from server
        const data = await getExamQuestions(examId!);
        // 2. Cache successfully loaded data
        await offlineStore.saveExamSession(examId!, data);
        return data;
      } catch (err) {
        // 3. Fallback to offline store on network failure
        const cached = await offlineStore.getExamSession(examId!);
        if (cached) {
          return cached;
        }
        throw err;
      }
    },
    enabled: examId !== null && examId > 0,
    staleTime: Infinity, // Questions don't change during a session
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });
}
