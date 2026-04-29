import { apiClient } from "@/lib/api/client";
import type {
  UserProfile,
  UserStats,
  UpdateProfilePayload,
  SecurityOverview,
  ChangePasswordPayload,
  PasswordChangeResult,
  AccountDeleteResult,
  Achievement,
  SuccessEnvelope,
} from "@/lib/api/types";

/** Fetch authenticated user's profile. */
export async function getProfile() {
  const response =
    await apiClient<SuccessEnvelope<UserProfile>>("/api/users/profile");
  return response.data;
}

/** Alias used by dashboard hooks. */
export const getUserProfile = getProfile;

/** Fetch user study stats. */
export async function getStats() {
  const response =
    await apiClient<SuccessEnvelope<UserStats>>("/api/users/stats");
  return response.data;
}

/** Alias used by dashboard hooks. */
export const getUserStats = getStats;

/** Update profile fields (partial). */
export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient<SuccessEnvelope<UserProfile>>(
    "/api/users/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Fetch full security overview — sessions + registered devices. */
export async function getSecurityOverview() {
  const response =
    await apiClient<SuccessEnvelope<SecurityOverview>>("/api/users/security");
  return response.data;
}

/** Change password — invalidates other sessions. */
export async function changePassword(payload: ChangePasswordPayload) {
  const response = await apiClient<SuccessEnvelope<PasswordChangeResult>>(
    "/api/users/password",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Delete account permanently — requires password confirmation. */
export async function deleteAccount(password: string) {
  const response = await apiClient<SuccessEnvelope<AccountDeleteResult>>(
    "/api/users/account",
    {
      method: "DELETE",
      body: JSON.stringify({ password }),
    },
  );
  return response.data;
}

/** Fetch user achievement badges with progress. */
export async function getAchievements() {
  const response =
    await apiClient<SuccessEnvelope<Achievement[]>>("/api/users/achievements");
  return response.data;
}
