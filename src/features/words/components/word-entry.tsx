import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { KIND_LABEL, yearPill } from "../lib/words";
import type { WordCardView } from "../types";
import s from "../words.module.css";
import { ArrowIcon, SayAs, Sentence } from "./bits";

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * One card on the public page, laid out like a dictionary entry, with the
 * real JAMB question under it. The options stay behind sign-up (the
 * founder's call, 19 Nov 2026): visitors see empty bubbles. Signed-in
 * students are sent to their dashboard card instead.
 */
export function WordEntry({ card, signedIn, here }: { card: WordCardView; signedIn: boolean; here: string }) {
  const facts = [
    ["Built from", card.builtFrom],
    ["Comes from", card.comesFrom],
    ["Opposite", card.opposite],
    ["Close to", card.closeTo],
  ].filter((pair): pair is [string, string] => Boolean(pair[1]));
  const question = card.question;
  const year = question?.year ?? card.cameOut.years[0] ?? null;
  const board = question?.board ?? card.cameOut.board ?? "JAMB";

  return (
    <article className={s.entry} aria-label={`${KIND_LABEL[card.kind]} of the day: ${card.headword}`}>
      <div className={s.etop}>
        <span>{KIND_LABEL[card.kind]}</span>
        <span className={s.pill}>{yearPill(card.cameOut)}</span>
      </div>
      <h2 className={s.hw}>{card.headword}</h2>
      <p className={s.say}>
        {card.sayAs ? <span><SayAs text={card.sayAs} /></span> : null}
        {card.ipa ? <span className={s.ipa}>{card.ipa}</span> : null}
        {card.partOfSpeech ? <span className={s.pos}>{card.partOfSpeech}</span> : null}
      </p>
      <p className={s.mean}>{card.meaning}</p>
      {card.examples.length ? (
        <ul className={s.egs}>
          {card.examples.map((example) => (
            <li key={example}>“{example}”</li>
          ))}
        </ul>
      ) : null}
      {facts.length ? (
        <dl className={s.facts}>
          {facts.map(([label, value]) => (
            <div key={label} style={{ display: "contents" }}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {card.watchOut ? (
        <div className={s.watch}>
          <b>Watch out</b>
          <p>{card.watchOut}</p>
        </div>
      ) : null}
      {question ? (
        <div className={s.paper}>
          <div className={s.slip}>
            <div className={s.ph}>
              <b>{year ? `Came out in ${board} ${year}` : `Came out in ${board}`}</b>
              <span>{question.subject === "English" ? "Use of English" : question.subject}</span>
            </div>
            {question.instruction ? <p className={s.inst}>{question.instruction}</p> : null}
            <p className={s.sent}><Sentence text={question.sentence} /></p>
            <div className={s.bubs} aria-hidden="true">
              {LETTERS.slice(0, Math.max(0, Math.min(5, question.optionCount))).map((letter) => (
                <span key={letter} className={s.bub}>{letter}</span>
              ))}
            </div>
            {signedIn ? (
              <>
                <div className={s.gate}>
                  <Link className={s.btn} href={"/dashboard" as Route}>Answer it on your dashboard</Link>
                </div>
                <p className={s.gnote}>Today&apos;s cards are on your dashboard, with the options, JAMB&apos;s answer and our explanation.</p>
              </>
            ) : (
              <>
                <div className={s.gate}>
                  <Link className={s.btn} href={`/signup?next=${encodeURIComponent(here)}` as Route}>Sign up free to answer</Link>
                  <Link className={s.ghost} href={`/login?next=${encodeURIComponent(here)}` as Route}>I have an account</Link>
                </div>
                <p className={s.gnote}>You&apos;ll see the {question.optionCount} options, JAMB&apos;s answer and our explanation.</p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

/**
 * The phrasal verb on the public page: a slim strip under the word and the
 * idiom, smaller on purpose (the founder, 20 Nov 2026). Its own page holds
 * the full entry.
 */
export function PhrasalStrip({ card }: { card: WordCardView }) {
  return (
    <section className={s.pvStrip} aria-label={`Phrasal verb of the day: ${card.headword}`}>
      <div className={cn(s.etop)}>
        <span>Phrasal verb of the day</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <p className={s.pvWord}>
          <span className={s.pvHw}>{card.headword}</span>
          {card.sayAs ? <span className={s.pvSay}><SayAs text={card.sayAs} /></span> : null}
        </p>
        <p className={s.pvMean}>{card.meaning}</p>
        {card.examples[0] ? <p className={s.pvEg}>“{card.examples[0]}”</p> : null}
      </div>
      <Link className={cn(s.link, s.pvMore)} href={`/word-of-the-day/${card.slug}` as Route}>
        The full card and its JAMB question
        <ArrowIcon className={s.arrow} />
      </Link>
    </section>
  );
}
