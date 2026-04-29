import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startExam, startDailyChallenge, type StartExamPayload, type StartDailyChallengePayload } from "@/lib/api/exams";
import type { ApiError } from "@/lib/api/errors";
import type { ExamSessionData } from "@/lib/api/types";

export function useStartExamMutation() {
  const queryClient = useQueryClient();

  return useMutation<ExamSessionData, ApiError, StartExamPayload>({
    mutationFn: async (payload) => {
      return await startExam(payload);
    },
    onSuccess: () => {
      // Invalidate relevant queries (history, active sessions etc)
      queryClient.invalidateQueries({ queryKey: ["exam-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "premium"] });
    },
  });
}

export function useStartDailyChallengeMutation() {
  const queryClient = useQueryClient();

  return useMutation<ExamSessionData, ApiError, StartDailyChallengePayload>({
    mutationFn: async (payload) => {
      return await startDailyChallenge(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "premium"] });
      queryClient.invalidateQueries({ queryKey: ["exam-eligibility"] });
    },
  });
}
