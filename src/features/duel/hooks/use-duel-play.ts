"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptDuelChallenge,
  createDuelChallenge,
  declineDuelChallenge,
  getDuelByCode,
  getDuelFaceOff,
  getDuelHome,
  getGhostOptions,
  getGhostResult,
  getRivalAnswers,
  requestRematch,
  startGhostRace,
  tapDuelReady,
  type CreateDuelPayload,
  type GhostLevel,
} from "@/lib/api/duel";
import { duelSessionQueryKey } from "@/features/duel/hooks/use-duel";

/* Hooks for the duel features added on 2026-11-08: home, face-off,
   challenges, rematches, review and ghost races. */

export const duelHomeQueryKey = ["duel", "home"] as const;

export function useDuelHome(enabled = true) {
  return useQuery({
    queryKey: duelHomeQueryKey,
    queryFn: getDuelHome,
    enabled,
    // Challenges arrive while the page is open.
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
}

/** The same session as useDuelSession, typed with the phase-two fields. */
export function useDuelFull(code: string, enabled = true) {
  return useQuery({
    queryKey: [...duelSessionQueryKey(code), "full"] as const,
    queryFn: () => getDuelByCode(code.toUpperCase()),
    enabled: enabled && code.trim().length > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.session.status;
      if (status === "WAITING") return 2500;
      if (status === "IN_PROGRESS") return 5000;
      return false;
    },
    retry: 1,
  });
}

export function useDuelFaceOff(sessionId: number | null) {
  return useQuery({
    queryKey: ["duel", "face-off", sessionId] as const,
    queryFn: () => getDuelFaceOff(sessionId as number),
    enabled: sessionId !== null,
    staleTime: 30_000,
  });
}

export function useTapReady(code: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => tapDuelReady(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: duelSessionQueryKey(code) });
    },
  });
}

export function useRivalAnswers(sessionId: number | null) {
  return useQuery({
    queryKey: ["duel", "rival-answers", sessionId] as const,
    queryFn: () => getRivalAnswers(sessionId as number),
    enabled: sessionId !== null,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useRematch() {
  return useMutation({ mutationFn: (sessionId: number) => requestRematch(sessionId) });
}

export function useChallenge() {
  return useMutation({
    mutationFn: (payload: CreateDuelPayload & { challengedUserId: number; isTaster?: boolean }) =>
      createDuelChallenge(payload),
  });
}

export function useAnswerChallenge() {
  const queryClient = useQueryClient();
  const accept = useMutation({
    mutationFn: (sessionId: number) => acceptDuelChallenge(sessionId),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: duelHomeQueryKey }),
  });
  const decline = useMutation({
    mutationFn: (sessionId: number) => declineDuelChallenge(sessionId),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: duelHomeQueryKey }),
  });
  return { accept, decline };
}

export function useGhostOptions(subject: string | null) {
  return useQuery({
    queryKey: ["duel", "ghost-options", subject] as const,
    queryFn: () => getGhostOptions(subject as string),
    enabled: Boolean(subject),
    staleTime: 60_000,
  });
}

export function useStartGhost() {
  return useMutation({
    mutationFn: (input: { subject: string; level: GhostLevel }) => startGhostRace(input.subject, input.level),
  });
}

export function useGhostResult(examId: number | null) {
  return useQuery({
    queryKey: ["duel", "ghost-result", examId] as const,
    queryFn: () => getGhostResult(examId as number),
    enabled: examId !== null,
    retry: 2,
  });
}
