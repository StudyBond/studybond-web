import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitExam, abandonExam } from "@/lib/api/exams";
import { offlineStore } from "@/features/exam/stores/offline-store";
import type { ExamResult, ExamAbandonResult, SubmitExamPayload } from "@/lib/api/types";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/client";

/** Submit exam answers — fires once, idempotency-keyed on the backend. */
export function useSubmitExamMutation() {
  const queryClient = useQueryClient();

  return useMutation<ExamResult | { queued: true; examId: number }, ApiError | Error, { examId: number; payload: SubmitExamPayload }>({
    mutationFn: async ({ examId, payload }) => {
      // If we are definitely offline, just queue it immediately
      if (typeof window !== "undefined" && !window.navigator.onLine) {
        await offlineStore.queueSubmit(examId, payload.answers);
        return { queued: true, examId };
      }

      try {
        return await submitExam(examId, payload);
      } catch (err: any) {
        // If it's a network error (status 0 or 'network' kind), queue it
        if (err?.kind === "network" || err?.message?.toLowerCase().includes("fetch")) {
          await offlineStore.queueSubmit(examId, payload.answers);
          return { queued: true, examId };
        }
        throw err;
      }
    },
    onSuccess: async (data, variables) => {
      // Clean up local cache since exam is done or securely queued
      await offlineStore.clearExamSession(variables.examId);

      if ("queued" in data) {
         toast.success("Network unstable. Your answers are saved securely and will submit upon reconnection.", { duration: 6000 });
         // We do not invalidate queries here because the backend state has not changed yet.
         return;
      }

      await offlineStore.clearQueuedSubmit(variables.examId);

      queryClient.invalidateQueries({ queryKey: ["exam-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

/** Abandon an in-progress exam. */
export function useAbandonExamMutation() {
  const queryClient = useQueryClient();

  return useMutation<ExamAbandonResult, ApiError, number>({
    mutationFn: (examId) => abandonExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
