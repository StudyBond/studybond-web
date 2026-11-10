/* Small synthesised sounds for the avatar maker and the leaderboard, from the
   mockup. No audio files. Fails silently when the browser blocks audio, and
   stays quiet for anyone who asked their system to reduce motion. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx || ctx.state === "closed") ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(f1: number, f2: number, at: number, dur: number, vol: number, type: OscillatorType = "triangle") {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t + at);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t + at + dur);
  gain.gain.setValueAtTime(0.0001, t + at);
  gain.gain.exponentialRampToValueAtTime(vol, t + at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t + at);
  osc.stop(t + at + dur + 0.02);
}

export const boardSounds = {
  tap: () => tone(1200, 0, 0, 0.04, 0.04),
  no: () => tone(220, 180, 0, 0.12, 0.05),
  save: () => {
    tone(659, 0, 0, 0.12, 0.07);
    tone(988, 0, 0.1, 0.22, 0.07);
  },
  /** You moved up the board. */
  up: () => [0, 1, 2].forEach((i) => tone(523 * Math.pow(1.26, i), 0, i * 0.11, 0.14, 0.07)),
  /** You made the top 10. */
  merit: () => {
    tone(150, 55, 0, 0.2, 0.28, "sine");
    [0, 1, 2, 3].forEach((i) => tone(659 * Math.pow(1.19, i), 0, 0.15 + i * 0.1, 0.18, 0.07));
  },
  pop: () => tone(660, 990, 0, 0.08, 0.05, "sine"),
};
