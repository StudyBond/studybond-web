import type {
  DuelMatchmakingState,
  DuelMatchmakingView,
} from "@/lib/api/duel-matchmaking";

export const DUEL_MATCHMAKING_QUERY_KEY = ["duel-matchmaking"] as const;

/** Search screen open: answer fast. */
export const CHECK_IN_FAST_MS = 3_000;
/** Searching from the bottom bar while studying. */
export const CHECK_IN_BAR_MS = 8_000;
/** Matched: both players are watching the Ready popup. */
export const CHECK_IN_MATCHED_MS = 2_000;
/** Tab in the background. Still well inside the server's 30-second window. */
export const CHECK_IN_HIDDEN_MS = 15_000;

/** After this long on the search screen, offer "Keep looking while I study". */
export const KEEP_LOOKING_PROMPT_SECONDS = 60;

const ACTIVE_FLAG_KEY = "sb:duel-search-active";
const NOTICE_SEEN_KEY = "sb:duel-notice-seen";
const LAUNCHED_KEY = "sb:duel-launched";

/* Storage can throw (private mode, blocked site data). Matchmaking still
   works without it: the flag only saves a request on pages where nobody is
   searching, and the server is always the source of truth. */
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Ignored on purpose, see above.
  }
}

export const ACTIVE_FLAG_STORAGE_KEY = ACTIVE_FLAG_KEY;

export function hasActiveSearchFlag() {
  return read(ACTIVE_FLAG_KEY) === "1";
}

export function setActiveSearchFlag(active: boolean) {
  write(ACTIVE_FLAG_KEY, active ? "1" : null);
}

/** True for states where this tab must keep checking in. */
export function isSearchActive(state: DuelMatchmakingState | undefined) {
  return state === "SEARCHING" || state === "MATCHED" || state === "STARTING";
}

/** Notices are shown once per browser, not once per tab or poll. */
export function takeUnseenNotice(view: DuelMatchmakingView) {
  if (!view.notice) return null;
  const seen = read(NOTICE_SEEN_KEY);
  if (seen && seen >= view.notice.at) return null;
  write(NOTICE_SEEN_KEY, view.notice.at);
  return view.notice;
}

/** First tab to see a started duel opens it; other tabs leave it alone. */
export function claimDuelLaunch(sessionCode: string) {
  if (read(LAUNCHED_KEY) === sessionCode) return false;
  write(LAUNCHED_KEY, sessionCode);
  return true;
}

/** The exam screen itself, not history, setup or results. */
export function isExamPath(pathname: string | null) {
  return !!pathname && /^\/exams\/\d+\/?$/.test(pathname);
}

/*
 * The Duel pages are moving from /dashboard/collaboration to /dashboard/duel.
 * Until that move ships, only the old path exists in production; once it
 * ships, the old path redirects to the new one. Linking to the old path works
 * either way. Switch this to "/dashboard/duel" once the move is live, and
 * before anything else reuses /dashboard/collaboration.
 */
export const DUEL_HOME_PATH = "/dashboard/collaboration";

export function duelRoomPath(sessionCode: string) {
  return `${DUEL_HOME_PATH}/${sessionCode}`;
}

/** The Duel page, under either name. */
export function isDuelHomePath(pathname: string | null) {
  return pathname === "/dashboard/duel" || pathname === "/dashboard/collaboration";
}

export function noticeMessage(code: string): { text: string; tone: "info" | "warning" } {
  switch (code) {
    case "PARTNER_DECLINED":
      return { text: "Your challenger couldn't make it. Still looking for someone else.", tone: "info" };
    case "PARTNER_MISSED":
      return { text: "Your challenger didn't tap Ready in time. You're back at the front of the line.", tone: "info" };
    case "YOU_MISSED":
      return { text: "You missed a challenger, so we stopped your search. Search again when you're ready.", tone: "warning" };
    case "START_FAILED":
      return { text: "We couldn't start that duel. Please search again.", tone: "warning" };
    case "SEARCH_ABANDONED":
      return { text: "Your duel search stopped while you were away.", tone: "info" };
    case "BOARD_CHANGED":
      return { text: "You switched exams, so we stopped your duel search.", tone: "info" };
    case "LEFT_FOR_EXAM":
      return { text: "You started an exam, so we let your challenger go.", tone: "info" };
    case "NOT_ELIGIBLE":
      return { text: "Duels need premium on this exam, so your search stopped.", tone: "warning" };
    default:
      return { text: "Your duel search changed. Take a look.", tone: "info" };
  }
}

export function describeSubjects(view: Pick<DuelMatchmakingView, "subjects" | "anySubject">) {
  if (view.anySubject || view.subjects.length === 0) return "any subject";
  if (view.subjects.length === 1) return view.subjects[0];
  if (view.subjects.length === 2) return `${view.subjects[0]} or ${view.subjects[1]}`;
  return `${view.subjects.length} subjects`;
}

export function formatElapsed(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function secondsSince(iso: string | null, now: number) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
}
