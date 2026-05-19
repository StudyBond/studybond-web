/**
 * Bookmark Exam Gate — Client-side mirror.
 *
 * Same pure function as the backend gate, used by the
 * BookmarkExamLauncher to render the correct UI state
 * without requiring an API call.
 */

export const BOOKMARK_EXAM_MIN_QUESTIONS = 20;

export type BookmarkExamGateStatus =
  | 'LOCKED_PREMIUM'
  | 'LOCKED_INSUFFICIENT'
  | 'UNLOCKED';

export type BookmarkExamGateResult =
  | { status: 'LOCKED_PREMIUM'; bookmarkCount: number }
  | { status: 'LOCKED_INSUFFICIENT'; bookmarkCount: number; required: number }
  | { status: 'UNLOCKED'; bookmarkCount: number };

export function evaluateBookmarkExamGate(
  bookmarkCount: number,
  isPremium: boolean,
): BookmarkExamGateResult {
  if (!isPremium) {
    return { status: 'LOCKED_PREMIUM', bookmarkCount };
  }

  if (bookmarkCount < BOOKMARK_EXAM_MIN_QUESTIONS) {
    return {
      status: 'LOCKED_INSUFFICIENT',
      bookmarkCount,
      required: BOOKMARK_EXAM_MIN_QUESTIONS,
    };
  }

  return { status: 'UNLOCKED', bookmarkCount };
}
