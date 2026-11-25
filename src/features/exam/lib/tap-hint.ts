/**
 * The results page's tap hint on a phone: when the question grid first comes
 * into sight, question 1 pulses and a label says "Tap to see the
 * explanation". It shows on the first few visits, and never again once the
 * student has tapped a question number.
 *
 * Kept on this device only. If storage is blocked (a private window), the
 * hint can show again next visit; nothing else depends on it.
 */
const KEY = "sb-review-tap-hint";
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

export function shouldShowTapHint(): boolean {
  const s = read();
  return !s.learned && s.shown < MAX_SHOWS;
}

export function noteTapHintShown() {
  const s = read();
  write({ ...s, shown: s.shown + 1 });
}

export function noteTapped() {
  const s = read();
  if (!s.learned) write({ ...s, learned: true });
}
