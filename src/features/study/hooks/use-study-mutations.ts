import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startStudySession, completeStudySession, getStudyTopics, StartStudySessionPayload, CompleteStudySessionPayload } from "@/lib/api/study";
import type { Subject } from "@/lib/api/exams";

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

export function useStudyTopics(subjects?: Subject[], institutionCode?: string, enabled = true) {
  return useQuery({
    queryKey: ["study-topics", subjects, institutionCode],
    queryFn: () => getStudyTopics(subjects, institutionCode),
    enabled: enabled && !!subjects && subjects.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
