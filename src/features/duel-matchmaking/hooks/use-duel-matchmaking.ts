"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelDuelSearch,
  getDuelMatchmaking,
  readyForDuel,
  searchForChallenger,
  type DuelMatchmakingView,
  type DuelSearchPayload,
} from "@/lib/api/duel-matchmaking";
import {
  DUEL_MATCHMAKING_QUERY_KEY,
  isSearchActive,
  setActiveSearchFlag,
} from "@/features/duel-matchmaking/lib/matchmaking-store";

/**
 * The student's search, as the Duel page sees it. While idle it refreshes the
 * "N students looking now" count every so often. Once a search is running,
 * the dock's check-ins keep this same cache entry up to date instead.
 */
export function useDuelMatchmaking(options: { refreshWhileIdle?: boolean } = {}) {
  return useQuery({
    queryKey: DUEL_MATCHMAKING_QUERY_KEY,
    queryFn: getDuelMatchmaking,
    staleTime: 10_000,
    refetchInterval: (query) =>
      options.refreshWhileIdle && !isSearchActive(query.state.data?.state)
        ? 15_000
        : false,
  });
}

/** Read-only view of the cache. Never fetches; the dock does the talking. */
export function useDuelMatchmakingCache() {
  return useQuery({
    queryKey: DUEL_MATCHMAKING_QUERY_KEY,
    queryFn: getDuelMatchmaking,
    enabled: false,
  });
}

function useApplyView() {
  const queryClient = useQueryClient();
  return (view: DuelMatchmakingView) => {
    queryClient.setQueryData(DUEL_MATCHMAKING_QUERY_KEY, view);
    setActiveSearchFlag(isSearchActive(view.state));
  };
}

export function useFindChallengerMutation() {
  const apply = useApplyView();
  return useMutation({
    mutationFn: (payload: DuelSearchPayload) => searchForChallenger(payload),
    onSuccess: apply,
  });
}

export function useReadyForDuelMutation() {
  const apply = useApplyView();
  return useMutation({
    mutationFn: readyForDuel,
    onSuccess: apply,
  });
}

export function useCancelDuelSearchMutation() {
  const apply = useApplyView();
  return useMutation({
    mutationFn: cancelDuelSearch,
    onSuccess: apply,
  });
}
