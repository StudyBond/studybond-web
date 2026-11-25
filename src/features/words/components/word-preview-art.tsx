import type { CSSProperties } from "react";

import { PreviewFrame, SlipHead, Tear } from "@/features/duel/share/card/link-preview";
import { paletteFor, type CardFonts } from "@/features/duel/share/card/share-card";

import { clip, KIND_LABEL, KIND_OF_THE_DAY, longDay, sayParts, shortDay } from "../lib/words";
import type { WordCardView, WordDay } from "../types";

/* Link previews for the word pages, 1200x630, drawn by next/og: the same
   tilted slip and lockup as the share cards, with the card laid out like a
   dictionary entry. Flexbox and inline styles only; sizes times `u`. */

const row = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "row", ...extra });
const col = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "column", ...extra });

/** "From JAMB 1978", "Came out in JAMB 1980 and 1981". */
function cameOutText(card: WordCardView): string {
  const board = card.cameOut.board ?? "JAMB";
  const years = card.cameOut.years;
  if (years.length === 0) return `From ${board} English`;
  if (years.length === 1) return `Came out in ${board} ${years[0]}`;
  return `Came out ${years.length === 2 ? "twice" : `${years.length} times`}: ${board} ${years.slice(0, -1).join(", ")} and ${years[years.length - 1]}`;
}

function WordSlip({ card, u, fonts, label, rest }: { card: WordCardView; u: number; fonts: CardFonts; label: string; rest: string }) {
  const p = paletteFor("AMBER");
  const long = card.headword.length;
  const size = long <= 11 ? 34 : long <= 15 ? 28 : 23;
  return (
    <div style={col()}>
      <SlipHead u={u} fonts={fonts} look="AMBER" label={label} rest={rest} />
      <span style={{ marginTop: 12 * u, fontFamily: fonts.head, fontSize: size * u, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>{card.headword}</span>
      <div style={row({ flexWrap: "wrap", alignItems: "baseline", gap: 6 * u, marginTop: 5 * u, fontSize: 12 * u })}>
        {card.sayAs ? (
          <div style={row({ fontWeight: 600, color: p.ink2 })}>
            {sayParts(card.sayAs).map((part, index) => (
              <span key={index} style={part.stressed ? { whiteSpace: "pre", color: p.word, fontWeight: 800 } : { whiteSpace: "pre" }}>
                {part.text}
              </span>
            ))}
          </div>
        ) : null}
        {card.partOfSpeech && card.partOfSpeech.toLowerCase() !== card.kind.replace("_", " ").toLowerCase() ? (
          <span style={{ color: p.ink2, fontStyle: "italic" }}>{card.partOfSpeech}</span>
        ) : null}
      </div>
      <span style={{ marginTop: 9 * u, fontSize: 12 * u, lineHeight: 1.4 }}>{clip(card.meaning, 115)}</span>
      <Tear u={u} look="AMBER" />
      <span style={{ marginTop: 10 * u, fontSize: 11 * u, fontWeight: 700 }}>{cameOutText(card)}</span>
    </div>
  );
}

/** studybond.app/word-of-the-day: the day's word on the slip, the idiom and phrasal verb beside it. */
export function WordDayPreviewArt({ day, u, fonts, origin, link }: { day: WordDay; u: number; fonts: CardFonts; origin: string; link: string }) {
  const main = day.word ?? day.idiom ?? day.phrasalVerb ?? null;
  if (!main) return null;
  const others = [day.word, day.idiom, day.phrasalVerb ?? null].filter((card): card is WordCardView => Boolean(card) && card !== main);
  const named = others.map((card) => `the ${KIND_LABEL[card.kind].toLowerCase()} “${card.headword}”`);
  const plus = named.length ? `Plus ${named.join(" and ")}. ` : "";
  return (
    <PreviewFrame
      u={u}
      fonts={fonts}
      origin={origin}
      look="AMBER"
      slip={<WordSlip card={main} u={u} fonts={fonts} label={KIND_OF_THE_DAY[main.kind]} rest={shortDay(day.date)} />}
      // A preview stays in the chat after midnight, so it names the day.
      title={`${longDay(day.date).split(",")[0]}’s words`}
      text={`${plus}All from real JAMB English papers. Free.`}
      link={link}
    />
  );
}

/** studybond.app/word-of-the-day/<slug>: one card. */
export function WordCardPreviewArt({ card, u, fonts, origin, link }: { card: WordCardView; u: number; fonts: CardFonts; origin: string; link: string }) {
  const what = card.kind === "IDIOM" ? "An idiom" : card.kind === "PHRASAL_VERB" ? "A phrasal verb" : "A word";
  return (
    <PreviewFrame
      u={u}
      fonts={fonts}
      origin={origin}
      look="AMBER"
      slip={<WordSlip card={card} u={u} fonts={fonts} label={KIND_LABEL[card.kind]} rest="" />}
      title={`${what} from real JAMB papers`}
      text="See how to say it and how it is used, then try the real question it came out in. Free."
      link={link}
    />
  );
}
