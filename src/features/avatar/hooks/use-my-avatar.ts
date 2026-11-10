"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyAvatar, saveMyAvatar, type MyAvatar } from "@/lib/api/avatar";
import type { AvatarLook } from "@/features/avatar/avatar-look";
import type { UserProfile } from "@/lib/api/types";

export const MY_AVATAR_KEY = ["avatar", "me"] as const;

/* Every cached copy of the student's own profile, so a saved avatar shows in
   the top bar, settings and the dashboard without a reload. */
const PROFILE_KEYS = [["dashboard", "profile"], ["user-profile"]] as const;

export function useMyAvatar() {
  return useQuery({
    queryKey: MY_AVATAR_KEY,
    queryFn: getMyAvatar,
    staleTime: 60_000,
  });
}

export function useSaveAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (look: AvatarLook) => saveMyAvatar(look),
    onSuccess: (data: MyAvatar) => {
      qc.setQueryData(MY_AVATAR_KEY, data);
      for (const key of PROFILE_KEYS) {
        qc.setQueryData<UserProfile>(key, (profile) => (profile ? { ...profile, avatar: data.avatar } : profile));
      }
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
