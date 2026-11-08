/**
 * Duel Sound Effects — Web Audio API
 *
 * Zero-dependency procedural audio for the duel experience.
 * All sounds are generated programmatically — no audio files needed.
 * Respects user's system volume and fails silently if AudioContext is blocked.
 */

let _ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!_ctx || _ctx.state === "closed") {
      _ctx = new AudioContext();
    }
    if (_ctx.state === "suspended") {
      _ctx.resume().catch(() => {});
    }
    return _ctx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  delay = 0,
) {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

/** Short tick sound for score counting */
export function playScoreTick() {
  playTone(1200, 0.06, "sine", 0.08);
}

/** Ascending fanfare for victory — three triumphant notes */
export function playVictoryFanfare() {
  playTone(523, 0.2, "triangle", 0.12, 0);      // C5
  playTone(659, 0.2, "triangle", 0.14, 0.15);    // E5
  playTone(784, 0.35, "triangle", 0.16, 0.30);   // G5
  playTone(1047, 0.5, "triangle", 0.18, 0.50);   // C6 — triumphant hold
}

/** Descending tone for defeat — two somber notes */
export function playDefeatSound() {
  playTone(440, 0.25, "sine", 0.08, 0);          // A4
  playTone(330, 0.4, "sine", 0.06, 0.2);          // E4
}

/** Neutral shimmer for draw */
export function playDrawSound() {
  playTone(523, 0.2, "triangle", 0.10, 0);
  playTone(659, 0.3, "triangle", 0.10, 0.15);
}

/** Impact sound when crown drops */
export function playCrownDrop() {
  playTone(220, 0.15, "square", 0.06, 0);
  playTone(440, 0.1, "sine", 0.12, 0.05);
  playTone(880, 0.08, "sine", 0.06, 0.08);
}

/** Sparkle burst for confetti */
export function playConfettiBurst() {
  const ctx = getContext();
  if (!ctx) return;

  // White noise burst
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(4000, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

/** VS clash impact */
export function playVsClash() {
  playTone(150, 0.12, "sawtooth", 0.08, 0);
  playTone(300, 0.08, "square", 0.06, 0.03);
}

/** Suspenseful reveal whoosh */
export function playRevealWhoosh() {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}
