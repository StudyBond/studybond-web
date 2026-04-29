import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  getSecurityOverview,
  changePassword,
  deleteAccount,
  getAchievements,
} from "@/lib/api/users";
import type {
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/lib/api/types";

export function useProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
}

export function useSecurityOverview() {
  return useQuery({
    queryKey: ["security-overview"],
    queryFn: getSecurityOverview,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["user-achievements"],
    queryFn: getAchievements,
  });
}
