"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelDuelSession,
  createDuelSession,
  getDuelSessionByCode,
  joinDuelSession,
  startDuelSession,
  updateDuelSessionName,
  leaveDuelSession,
  getDuelDurationOptions,
  updateDuelDuration,
  type CreateDuelPayload,
} from "@/lib/api/duel";
import type { ApiError } from "@/lib/api/client";

export function duelSessionQueryKey(code: string) {
  return ["duel", "session", code.toUpperCase()] as const;
}

export function useDuelSession(code: string, enabled = true) {
  return useQuery({
    queryKey: duelSessionQueryKey(code),
    queryFn: () => getDuelSessionByCode(code.toUpperCase()),
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

export function useCreateDuelMutation() {
  return useMutation({
    mutationFn: (payload: CreateDuelPayload) =>
      createDuelSession(payload),
  });
}

export function useJoinDuelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => joinDuelSession(code.toUpperCase()),
    onSuccess: (data) => {
      queryClient.setQueryData(
        duelSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useStartDuelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => startDuelSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        duelSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useLeaveDuelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => leaveDuelSession(sessionId),
    onSuccess: (data) => {
      // The leave endpoint returns { success, message, session? } which
      // does NOT match the DuelSessionSnapshot shape the query
      // cache expects. Invalidate instead of writing corrupted data.
      if (data.session?.code) {
        queryClient.invalidateQueries({
          queryKey: duelSessionQueryKey(data.session.code),
        });
      }
    },
  });
}

export function useCancelDuelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => cancelDuelSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        duelSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export function useRenameDuelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      customName,
    }: {
      sessionId: number;
      customName: string | null;
    }) => updateDuelSessionName(sessionId, customName),
    onSuccess: (data) => {
      queryClient.setQueryData(
        duelSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

/**
 * The normal duel time for these subjects and the range a host may pick.
 * Subject times change perhaps twice a year, so this is held for a while.
 */
export function useDuelDurationOptions(subjects: string[], enabled = true) {
  const sorted = [...subjects].sort();
  return useQuery({
    queryKey: ["duel", "duration-options", sorted.join(",")] as const,
    queryFn: () => getDuelDurationOptions(sorted),
    enabled: enabled && sorted.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateDuelDurationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      durationSeconds,
    }: {
      sessionId: number;
      durationSeconds: number;
    }) => updateDuelDuration(sessionId, durationSeconds),
    onSuccess: (data) => {
      queryClient.setQueryData(
        duelSessionQueryKey(data.session.code),
        data,
      );
    },
  });
}

export type DuelMutationError = ApiError | Error;
