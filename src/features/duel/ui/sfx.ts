"use client";

/* The duel's small sounds, from the mockup: short oscillator blips, no audio
   files. Browsers only allow sound after a tap, so every call is a no-op
   until then, and any failure is silent. */

export type DuelSound =
  | "tap"
  | "add"
  | "remove"
  | "no"
  | "print"
  | "go"
  | "ready"
  | "count"
  | "start"
  | "tick"
  | "whistle"
  | "react";

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!context) context = new Ctor();
    if (context.state === "suspended") void context.resume();
    return context;
  } catch {
    return null;
  }
}

export function playDuelSound(kind: DuelSound) {
  const ac = audio();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const tone = (f1: number, f2: number, at: number, dur: number, vol: number, type: OscillatorType = "sine") => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f1, t + at);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + dur);
      g.gain.setValueAtTime(0.0001, t + at);
      g.gain.exponentialRampToValueAtTime(vol, t + at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t + at);
      o.stop(t + at + dur + 0.02);
    };
    switch (kind) {
      case "print":
        for (let i = 0; i < 16; i++) tone(2200 + (i % 2) * 300, 0, i * 0.056, 0.03, 0.025, "square");
        break;
      case "go":
        tone(523, 0, 0, 0.12, 0.08, "triangle");
        tone(784, 0, 0.1, 0.22, 0.09, "triangle");
        break;
      case "ready":
        tone(660, 990, 0, 0.12, 0.07, "triangle");
        break;
      case "count":
        tone(740, 0, 0, 0.12, 0.08, "triangle");
        break;
      case "start":
        tone(988, 0, 0, 0.32, 0.09, "triangle");
        break;
      case "add":
        tone(880, 1320, 0, 0.07, 0.05, "triangle");
        break;
      case "remove":
        tone(660, 440, 0, 0.07, 0.04, "triangle");
        break;
      case "no":
        tone(220, 170, 0, 0.14, 0.06, "triangle");
        break;
      case "tick":
        tone(880, 0, 0, 0.09, 0.07, "triangle");
        break;
      case "whistle":
        tone(2100, 2300, 0, 0.18, 0.05);
        tone(2100, 2300, 0.24, 0.5, 0.05);
        break;
      case "react":
        tone(1180, 1560, 0, 0.08, 0.05, "triangle");
        break;
      default:
        tone(1400, 0, 0, 0.035, 0.04, "triangle");
    }
  } catch {
    // Sound is a nicety; never let it break a screen.
  }
}
