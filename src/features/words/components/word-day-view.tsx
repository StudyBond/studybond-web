import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { KIND_LABEL, cameOutLine, longDay, shortDay } from "../lib/words";
import type { ArchiveItem, WordArchive, WordCardView, WordDay, WordKind } from "../types";
import s from "../words.module.css";
import { ArrowIcon } from "./bits";
import { PhrasalStrip, WordEntry } from "./word-entry";

const HERE = "/word-of-the-day";

/**
 * studybond.app/word-of-the-day (mockup boards "laptop" and "phone"): today's
 * word and idiom as dictionary entries, the phrasal verb as a slim strip,
 * then the earlier days. Same cards for everyone, new at midnight Lagos time.
 */
export function WordDayView({ day, archive, signedIn, before }: {
  day: WordDay | null;
  archive: WordArchive | null;
  signedIn: boolean;
  /** Set when the visitor is paging through older days (?before=). */
  before?: string;
}) {
  const cards = [day?.word, day?.idiom].filter((card): card is WordCardView => Boolean(card));
  const phrasal = day?.phrasalVerb ?? null;
  const hasToday = cards.length > 0 || Boolean(phrasal);

  return (
    <div className={cn("sb-ui", s.page)}>
      <main className={s.wrap}>
        <div className={s.hd}>
          {day ? <p className={s.date}>{longDay(day.date)}</p> : null}
          <h1>Word of the day</h1>
          <p className={s.sub}>
            A word, an idiom and a phrasal verb a day, all from real JAMB English papers. New ones come out at midnight.
          </p>
        </div>

        {before ? null : hasToday ? (
          <>
            {cards.length ? (
              <div className={s.pair}>
                {cards.map((card) => (
                  <WordEntry key={card.id} card={card} signedIn={signedIn} here={HERE} />
                ))}
              </div>
            ) : null}
            {phrasal ? <PhrasalStrip card={phrasal} /> : null}
          </>
        ) : (
          <div className={s.none}>
            <h2>The first words come out soon</h2>
            <p>Every card is a word, an idiom or a phrasal verb that came out in a real JAMB English paper, with the question it came from. Check back after midnight.</p>
          </div>
        )}

        <ArchiveList archive={archive} />

        <section className={s.band} aria-label="Practise on StudyBond">
          <div>
            <h3>{hasToday || archive?.days.length ? "These words came from real JAMB papers." : "Practise real JAMB papers while you wait."}</h3>
            <p>Practise the full papers on StudyBond, with an explanation for every answer. Free to start.</p>
          </div>
          <Link className={s.btn} href={(signedIn ? "/dashboard" : `/signup?next=${encodeURIComponent(HERE)}`) as Route}>
            {signedIn ? "Go to your dashboard" : "Get started"}
          </Link>
        </section>
      </main>
    </div>
  );
}

function ArchiveList({ archive }: { archive: WordArchive | null }) {
  const days = archive?.days ?? [];
  if (days.length === 0) return null;
  const cols = days.some((day) => day.phrasalVerb) ? 3 : 2;
  return (
    <section className={s.arch} aria-labelledby="arch-h">
      <h2 id="arch-h">Earlier words</h2>
      <p className={s.sub} style={{ marginTop: 6, fontSize: 15.5 }}>Every one came out in a real JAMB paper. Some came out more than once.</p>
      <ol className={s.days}>
        {days.map((day) => (
          <li key={day.date} className={s.day} style={{ ["--cols" as string]: cols }}>
            <span className={s.dl}>{shortDay(day.date)}</span>
            {day.word ? <ArchiveCard kind="WORD" item={day.word} /> : <span />}
            {day.idiom ? <ArchiveCard kind="IDIOM" item={day.idiom} /> : <span />}
            {cols === 3 ? (day.phrasalVerb ? <ArchiveCard kind="PHRASAL_VERB" item={day.phrasalVerb} /> : <span />) : null}
          </li>
        ))}
      </ol>
      {archive?.nextBefore ? (
        <Link className={s.older} href={`${HERE}?before=${archive.nextBefore}` as Route}>
          Older words
          <ArrowIcon className={s.arrow} />
        </Link>
      ) : null}
    </section>
  );
}

function ArchiveCard({ kind, item }: { kind: WordKind; item: ArchiveItem }) {
  const line = cameOutLine(item.cameOut);
  return (
    <Link className={s.item} href={`${HERE}/${item.slug}` as Route}>
      <span className={s.k}>{KIND_LABEL[kind]}</span>
      <span className={s.w}>
        <b>{item.headword}</b>
        {item.partOfSpeech ? <span>{item.partOfSpeech}</span> : null}
      </span>
      <p className={s.m}>{item.meaning}</p>
      <p className={cn(s.j, line.repeated && s.twice)}>{line.text}</p>
    </Link>
  );
}
