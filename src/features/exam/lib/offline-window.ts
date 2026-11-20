/**
 * How long after the clock runs out a paper saved offline is still accepted.
 * The server allows these plus 90 seconds (studybond-backend exams.constants:
 * OFFLINE_SUBMISSION_EXTENDED_GRACE_SECONDS, DUEL_OFFLINE_SUBMISSION_GRACE_SECONDS);
 * the card tells the student the shorter figure, so a paper sent at the very
 * end still gets in. Keep the two in step.
 */
export const OFFLINE_SEND_WINDOW_MINUTES = 45;
export const DUEL_OFFLINE_SEND_WINDOW_MINUTES = 5;

/**
 * The moment a saved paper stops being accepted: when the clock runs out
 * (now + what is left on it), plus the window.
 */
export function offlineSendDeadline(remainingSeconds: number, isDuel: boolean, now = Date.now()): number {
  const windowMinutes = isDuel ? DUEL_OFFLINE_SEND_WINDOW_MINUTES : OFFLINE_SEND_WINDOW_MINUTES;
  return now + Math.max(0, remainingSeconds) * 1000 + windowMinutes * 60 * 1000;
}
