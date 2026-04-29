"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelCollaborationSession,
  createCollaborationSession,
  getCollaborationSessionByCode,
  joinCollaborationSession,
  startCollaborationSession,
  updateCollaborationSessionName,
  leaveCollaborationSession,
  type CreateCollaborationPayload,
} from "@/lib/api/collaboration";
import type { ApiError } from "@/lib/api/client";

export function collaborationSessionQueryKey(code: string) {
  return ["collaboration", "session", code.toUpperCase()] as const;
}

export function useCollaborationSession(code: string, enabled = true) {
  return useQuery({
    queryKey: collaborationSessionQueryKey(code),
    queryFn: () => getCollaborationSessionByCode(code.toUpperCase()),
    enabled: enabled && code.trim().length > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.session.status;
      if (status === "WAITING") return 3000;
      if (status === "IN_PROGRESS") return 5000;
      return false;
    },
    retry: 1,
  });
}

export function useCreateCollaborationMutation() {
  return useMutation({
    mutationFn: (payload: CreateCollaborationPayload) =>
      createCollaborationSession(payload),
  });
}

export function useJoinCollaborationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => joinCollaborationSession(code.toUpperCase()),
    onSuccess: (data) => {
      queryClient.setQueryData(
        collaborationSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useStartCollaborationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => startCollaborationSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        collaborationSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useLeaveCollaborationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => leaveCollaborationSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        collaborationSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useCancelCollaborationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => cancelCollaborationSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        collaborationSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useRenameCollaborationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      customName,
    }: {
      sessionId: number;
      customName: string | null;
    }) => updateCollaborationSessionName(sessionId, customName),
    onSuccess: (data) => {
      queryClient.setQueryData(
        collaborationSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export type CollaborationMutationError = ApiError | Error;
