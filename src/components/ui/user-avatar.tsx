"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/features/avatar/components/avatar";
import type { AvatarLook } from "@/features/avatar/avatar-look";
import { getUserProfile } from "@/lib/api/users";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizePx: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

type UserAvatarProps = {
  /** Someone's avatar. Leave it out to show the signed-in student's own. */
  look?: Partial<AvatarLook> | null;
  /** @deprecated Old DiceBear pick, ignored. Avatars live on the account now. */
  avatarId?: string;
  size?: AvatarSize;
  /** Exact size in px; wins over size. */
  px?: number;
  /** @deprecated The old animated ring is gone: frames are earned, never bought. */
  showRing?: boolean;
  /** @deprecated See showRing. */
  isPremium?: boolean;
  className?: string;
};

/* The signed-in student's avatar comes from their profile, which every
   learner page already loads under this key, so this rarely costs a request. */
function useOwnLook(enabled: boolean) {
  const profile = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getUserProfile,
    staleTime: 60_000,
    enabled,
  });
  return profile.data?.avatar ?? null;
}

export function UserAvatar({ look, size = "md", px, className }: Readonly<UserAvatarProps>) {
  const own = useOwnLook(look === undefined);
  return (
    <Avatar
      look={look === undefined ? own : look}
      size={px ?? sizePx[size]}
      className={cn("shrink-0", className)}
    />
  );
}
