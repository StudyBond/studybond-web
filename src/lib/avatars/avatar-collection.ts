/**
 * StudyBond — Curated Avatar Collection
 *
 * A set of hand-curated avatar identities reflecting courses, professions, 
 * and student personalities. These use high-quality 3D DiceBear Micah SVGs.
 *
 * Users pick from this set. The selected `avatarId` is persisted
 * per-user to localStorage (keyed by userId) and eventually to the backend.
 */

export type CuratedAvatar = {
  id: string;
  name: string;
  /** Primary gradient colors [from, to] */
  gradient: [string, string];
  /** The DiceBear seed string to generate the 3D face */
  seed: string;
  /** Representing subtext */
  subtext: string;
};

export const CURATED_AVATARS: CuratedAvatar[] = [
  {
    id: "freshman",
    name: "The Freshman",
    subtext: "Just getting started",
    gradient: ["#64748b", "#334155"],
    seed: "Felix", // Neutral/Standard
  },
  {
    id: "future-doctor",
    name: "Future Doctor",
    subtext: "Medicine & Surgery",
    gradient: ["#34d399", "#059669"],
    seed: "Jude", 
  },
  {
    id: "tech-architect",
    name: "Tech Architect",
    subtext: "Computer Science",
    gradient: ["#38bdf8", "#0284c7"],
    seed: "Oliver", 
  },
  {
    id: "legal-eagle",
    name: "Legal Eagle",
    subtext: "Law & Justice",
    gradient: ["#a78bfa", "#7c3aed"],
    seed: "Aneka", 
  },
  {
    id: "future-ceo",
    name: "Future CEO",
    subtext: "Business & Finance",
    gradient: ["#fbbf24", "#d97706"],
    seed: "Jack", 
  },
  {
    id: "odogwu-engineer",
    name: "Odogwu Engineer",
    subtext: "Engineering",
    gradient: ["#f97316", "#dc2626"],
    seed: "George", 
  },
  {
    id: "the-creative",
    name: "The Creative",
    subtext: "Arts & Humanities",
    gradient: ["#f472b6", "#be185d"],
    seed: "Abby", 
  },
  {
    id: "the-thinker",
    name: "The Thinker",
    subtext: "Social Sciences",
    gradient: ["#22d3ee", "#14b8a6"],
    seed: "Liam", 
  },
  {
    id: "agricultural-boss",
    name: "Agric Boss",
    subtext: "Agriculture",
    gradient: ["#a3e635", "#16a34a"],
    seed: "Milo", 
  },
  {
    id: "pharmacy-expert",
    name: "Pharma Expert",
    subtext: "Pharmacy",
    gradient: ["#ec4899", "#8b5cf6"],
    seed: "Chloe", 
  },
  {
    id: "media-mogul",
    name: "Media Mogul",
    subtext: "Mass Communication",
    gradient: ["#fde68a", "#f59e0b"],
    seed: "Mia", 
  },
  {
    id: "the-educator",
    name: "The Educator",
    subtext: "Education",
    gradient: ["#6366f1", "#1e40af"],
    seed: "Eden", 
  }
];

export const DEFAULT_AVATAR_ID = "freshman";

export function getAvatarById(id: string | undefined): CuratedAvatar {
  if (!id) return CURATED_AVATARS[0];
  return CURATED_AVATARS.find((a) => a.id === id) ?? CURATED_AVATARS[0];
}

/** Build a per-user storage key for the avatar. */
function getAvatarStorageKey(userId?: number): string {
  if (userId) return `sb-avatar-${userId}`;
  return "sb-avatar-id"; // Legacy fallback
}

export function getSavedAvatarId(userId?: number): string {
  if (typeof window === "undefined") return DEFAULT_AVATAR_ID;

  // Try user-specific key first
  if (userId) {
    const userSpecific = localStorage.getItem(getAvatarStorageKey(userId));
    if (userSpecific) return userSpecific;

    // Migrate legacy key to user-specific
    const legacy = localStorage.getItem("sb-avatar-id");
    if (legacy) {
      localStorage.setItem(getAvatarStorageKey(userId), legacy);
      return legacy;
    }
  }

  // Fallback to legacy key
  return localStorage.getItem("sb-avatar-id") ?? DEFAULT_AVATAR_ID;
}

export function saveAvatarId(id: string, userId?: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getAvatarStorageKey(userId), id);
  // Also write legacy key for backward compat
  localStorage.setItem("sb-avatar-id", id);
}
