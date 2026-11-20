/**
 * The review's swipe hint on a phone: the card slides a little and a label
 * says "Swipe to move between questions". It shows the first few times a
 * question opens, and never again once the student has swiped once.
 *
 * Kept on this device only. If storage is blocked (a private window), the
 * hint can show again next visit; nothing else depends on it.
 */
const KEY = "sb-review-swipe-hint";
const MAX_SHOWS = 3;

type HintState = { shown: number; learned: boolean };

function read(): HintState {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Partial<HintState> | null;
    return { shown: Number(raw?.shown) || 0, learned: raw?.learned === true };
  } catch {
    return { shown: 0, learned: false };
  }
}

function write(state: HintState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: fine, see above.
  }
}

export function shouldShowSwipeHint(): boolean {
  const s = read();
  return !s.learned && s.shown < MAX_SHOWS;
}

export function noteSwipeHintShown() {
  const s = read();
  write({ ...s, shown: s.shown + 1 });
}

export function noteSwiped() {
  const s = read();
  if (!s.learned) write({ ...s, learned: true });
}
