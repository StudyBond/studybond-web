import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startStudySession, completeStudySession, StartStudySessionPayload, CompleteStudySessionPayload } from "@/lib/api/study";

export function useStartStudySession() {
  return useMutation({
    mutationFn: (payload: StartStudySessionPayload) => startStudySession(payload),
  });
}

export function useCompleteStudySession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ examId, payload }: { examId: number; payload: CompleteStudySessionPayload }) => 
      completeStudySession(examId, payload),
    onSuccess: () => {
      // Invalidate dashboard/history query cache to refresh stats
      queryClient.invalidateQueries({ queryKey: ["dashboard-critical-data"] });
      queryClient.invalidateQueries({ queryKey: ["exam-history"] });
    }
  });
}
