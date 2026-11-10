/**
 * Retired. Avatars used to be 12 DiceBear pictures kept in this browser's
 * localStorage (`sb-avatar-id`, `sb-avatar-<userId>`), which leaked between
 * accounts on a shared phone and loaded images from api.dicebear.com.
 *
 * They now live on the account (GET/PUT /api/users/avatar) and are drawn by
 * features/avatar/components/avatar.tsx. UserAvatar ignores the id below.
 *
 * Only `getSavedAvatarId` is left, because the learner shell and the new-user
 * dashboard still import it and are not ours to edit right now. Delete this
 * file once they stop importing it.
 */

const LEGACY_KEY = /^sb-avatar-(id|\d+)$/;
let cleared = false;

/** Removes the old avatar keys from this browser, once per page load. */
function clearLegacyAvatarKeys(): void {
  if (cleared || typeof window === "undefined") return;
  cleared = true;
  try {
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && LEGACY_KEY.test(key)) stale.push(key);
    }
    stale.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage blocked or unavailable: nothing to clear.
  }
}

/** @deprecated Always "account". The avatar comes from the profile now. */
export function getSavedAvatarId(userId?: number): string {
  void userId;
  clearLegacyAvatarKeys();
  return "account";
}
