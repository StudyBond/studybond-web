import type { CSSProperties } from "react";

import { PreviewFrame, SlipHead, Tear } from "@/features/duel/share/card/link-preview";
import { paletteFor, type CardFonts } from "@/features/duel/share/card/share-card";

/* The homepage's link preview, 1200x630, drawn by next/og: the share cards'
   tilted slip holding a real JAMB question (English 1978) with its answer
   bubbles left empty. Flexbox and inline styles only; sizes times `u`. */

const row = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "row", ...extra });
const col = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "column", ...extra });

export const HOME_PREVIEW = {
  // A non-breaking hyphen, so "Post-UTME" never splits across two lines.
  title: "JAMB and UI Post‑UTME past questions",
  text: "Real papers, timed like the real CBT. Every answer explained. Free to start.",
};

export function HomePreviewArt({ u, fonts, origin }: { u: number; fonts: CardFonts; origin: string }) {
  const p = paletteFor("AMBER");
  const lines: Array<[string, string]> = [
    ["Clock", "Timed like the real CBT"],
    ["Answers", "Every one explained"],
  ];
  const slip = (
    <div style={col()}>
      <SlipHead u={u} fonts={fonts} look="AMBER" label="JAMB UTME" rest="English 1978" />
      <span style={{ marginTop: 12 * u, fontSize: 10.5 * u, color: p.ink2 }}>Complete the sentence.</span>
      <span style={{ marginTop: 4 * u, fontFamily: fonts.head, fontSize: 17 * u, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
        The green snake which lives in the green grass is using a perfect ______.
      </span>
      <div style={row({ gap: 8 * u, marginTop: 12 * u })}>
        {["A", "B", "C", "D", "E"].map((letter) => (
          <div
            key={letter}
            style={row({
              width: 24 * u,
              height: 24 * u,
              borderRadius: 24 * u,
              border: `${1.5 * u}px solid ${p.ink2}`,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5 * u,
              fontWeight: 700,
              color: p.ink2,
            })}
          >
            {letter}
          </div>
        ))}
      </div>
      <Tear u={u} look="AMBER" />
      <div style={col({ gap: 3 * u, marginTop: 10 * u, fontSize: 11 * u })}>
        {lines.map(([k, v]) => (
          <div key={k} style={row({ gap: 8 * u })}>
            <span style={{ width: 56 * u, color: p.ink2 }}>{k}</span>
            <span style={{ flex: 1, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return <PreviewFrame u={u} fonts={fonts} origin={origin} slip={slip} look="AMBER" title={HOME_PREVIEW.title} text={HOME_PREVIEW.text} link="studybond.app" />;
}
