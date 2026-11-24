"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/* "Outsmart the Exam." becomes "Outsmart JAMB." and "Outsmart UI Post-UTME."
   The server sends only "the Exam.", so search engines and anyone without
   JavaScript read "Outsmart the Exam. Outrank the Rest." The other two words
   are added in the browser, hidden from screen readers, so a screen reader
   always hears the same headline. With reduced motion nothing rotates.

   The slot is sized for "the Exam." (landing.css, .hero-left .rot); a longer
   word runs on to the right, so "Outsmart" and the line below never move. */

const WORDS = ["the Exam", "JAMB", "UI Post-UTME"] as const;
const EVERY_MS = 2600;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/* False on the server and during hydration, so the first paint matches the
   server's single word; true in the browser unless motion is reduced. */
function useCanMove() {
  return useSyncExternalStore(
    subscribeMotion,
    () => !window.matchMedia(REDUCED).matches,
    () => false,
  );
}

function wordClass(i: number, shown: number) {
  if (i === shown) return "w-on";
  return i === (shown + WORDS.length - 1) % WORDS.length ? "w-up" : "w-down";
}

export function RotatingExamWord() {
  const canMove = useCanMove();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!canMove) return;
    const id = window.setInterval(() => setShown((i) => (i + 1) % WORDS.length), EVERY_MS);
    return () => window.clearInterval(id);
  }, [canMove]);

  if (!canMove) {
    return (
      <span className="rot k0">
        <span className="w-on">{WORDS[0]}.</span>
      </span>
    );
  }

  return (
    <span className={`rot k${shown}`}>
      {WORDS.map((word, i) => (
        <span key={word} className={wordClass(i, shown)} aria-hidden={i === 0 ? undefined : true}>
          {word}.
        </span>
      ))}
    </span>
  );
}
