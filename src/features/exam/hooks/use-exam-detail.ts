import { useQuery } from "@tanstack/react-query";
import { getExamDetail } from "@/lib/api/exams";
import { offlineStore } from "@/features/exam/stores/offline-store";

export function useExamDetail(examId: number) {
  return useQuery({
    queryKey: ["exam-detail", examId],
    queryFn: async () => {
      try {
        const result = await getExamDetail(examId);
        if (result) {
          offlineStore.saveExamResult(examId, result).catch(() => {});
        }
        return result;
      } catch (err: any) {
        // Fall back to IndexedDB cache on network/fetch errors
        const isOffline = typeof window !== "undefined" && !window.navigator.onLine;
        const isNetworkErr = err?.kind === "network" || err?.message?.toLowerCase().includes("fetch");
        if (isOffline || isNetworkErr) {
          const cached = await offlineStore.getExamResult(examId);
          if (cached) {
            return cached;
          }
        }
        throw err;
      }
    },
    enabled: !!examId,
  });
}
