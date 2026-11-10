import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";
import type { AvatarLook, AvatarView } from "@/features/avatar/avatar-look";

export type AvatarFrames = {
  merit: {
    earned: boolean;
    best: { rank: number; weekStartDate: string; institutionCode: string; institutionName: string } | null;
    minPlayers: number;
    top: number;
  };
  duel: { earned: boolean; current: number; target: number };
  streak: { earned: boolean; current: number; longest: number; target: number };
};

export type MyAvatar = {
  avatar: AvatarView;
  frames: AvatarFrames;
};

/** The student's avatar and which frames they have earned. */
export async function getMyAvatar() {
  const response = await apiClient<SuccessEnvelope<MyAvatar>>("/api/users/avatar");
  return response.data;
}

/** Save all seven parts at once. A frame not earned yet is refused (403). */
export async function saveMyAvatar(look: AvatarLook) {
  const response = await apiClient<SuccessEnvelope<MyAvatar>>("/api/users/avatar", {
    method: "PUT",
    body: JSON.stringify(look),
  });
  return response.data;
}
