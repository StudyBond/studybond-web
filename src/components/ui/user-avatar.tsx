"use client";

import { cn } from "@/lib/utils/cn";
import { getAvatarById, getSavedAvatarId } from "@/lib/avatars/avatar-collection";
import type { CuratedAvatar } from "@/lib/avatars/avatar-collection";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, { container: string; ring: string }> = {
  xs: { container: "h-6 w-6", ring: "p-[1.5px]" },
  sm: { container: "h-8 w-8", ring: "p-[2px]" },
  md: { container: "h-10 w-10", ring: "p-[2px]" },
  lg: { container: "h-12 w-12", ring: "p-[2.5px]" },
  xl: { container: "h-16 w-16", ring: "p-[3px]" },
};

type UserAvatarProps = {
  /** Optional override to pass the avatar directly */
  avatar?: CuratedAvatar;
  /** Pass the ID of the avatar to load */
  avatarId?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Whether to show the animated gradient ring */
  showRing?: boolean;
  /** Whether this is a premium user */
  isPremium?: boolean;
  /** Additional class name */
  className?: string;
};

export function UserAvatar({
  avatar: avatarProp,
  avatarId,
  size = "md",
  showRing = true,
  isPremium = false,
  className,
}: Readonly<UserAvatarProps>) {
  const resolvedAvatar = avatarProp ?? getAvatarById(avatarId ?? getSavedAvatarId());
  const s = sizeMap[size];

  const inner = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden shrink-0",
        s.container,
      )}
      style={{
        background: `linear-gradient(135deg, ${resolvedAvatar.gradient[0]}, ${resolvedAvatar.gradient[1]})`,
      }}
    >
      <img 
        src={`https://api.dicebear.com/7.x/micah/svg?seed=${resolvedAvatar.seed}&backgroundColor=transparent`}
        alt={resolvedAvatar.name}
        className="absolute inset-0 h-full w-full object-cover translate-y-[8%]"
      />
    </div>
  );

  if (!showRing) {
    return <div className={cn("shrink-0", className)}>{inner}</div>;
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-full",
        s.ring,
        isPremium ? "sb-avatar-ring-gold" : "sb-avatar-ring",
        className,
      )}
    >
      {inner}
    </div>
  );
}

/** Compact avatar for lists/leaderboards — just initials with accent bg */
export function InitialsAvatar({
  name,
  size = "sm",
  className,
}: {
  name: string;
  size?: AvatarSize;
  className?: string;
}) {
  const initials = (name || "User")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[var(--sb-accent)]/20 text-[var(--sb-accent)] ring-1 ring-[var(--sb-accent)]/30 shrink-0",
        s.container,
        className,
      )}
    >
      <span className={cn("font-bold select-none", size === "xs" ? "text-[8px]" : "text-[10px]")}>
        {initials}
      </span>
    </div>
  );
}
