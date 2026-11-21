"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useId, useState } from "react";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { cn } from "@/lib/utils/cn";

import { getMyWordDay, sendWordAttempt, wordKeys } from "../api";
import { KIND_OF_THE_DAY, comesBackLine, questionLabel, yearPill } from "../lib/words";
import type { AttemptBody, MyCard, MyWordDay, OptionLetter } from "../types";
import s from "../words.module.css";
import { ArrowIcon, ChevronIcon, CrossIcon, SayAs, Sentence, TickIcon } from "./bits";

type Field = "word" | "idiom" | "phrasalVerb";

/**
 * The dashboard card (mockup boards "Dashboard card" and "after Not yet and
 * a wrong pick"): the word and the idiom side by side on a laptop, the
 * phrasal verb as a slim row under them, and the word book link. Each card
 * goes stress tap (words only), think first, "I knew it / Not yet", then the
 * real JAMB question. Every step is saved once by the backend. The card
 * hides itself until the day has a card, so it can ship before launch.
 */
export function WordDayCard({ className }: { className?: string }) {
  const query = useQuery({ queryKey: wordKeys.myDay, queryFn: getMyWordDay, staleTime: 60_000, retry: 1 });
  const day = query.data;
  if (!day) return null;
  const phrasal = day.phrasalVerb ?? null;
  if (!day.word && !day.idiom && !phrasal) return null;

  return (
    <div className={cn("sb-ui", s.cardWrap, className)}>
      <section className={s.card} aria-label="Word of the day">
        {day.word || day.idiom ? (
          <div className={s.cols}>
            {day.word ? <CardPart field="word" mine={day.word} /> : null}
            {day.idiom ? <CardPart field="idiom" mine={day.idiom} /> : null}
          </div>
        ) : null}
        {phrasal ? <PhrasalRow mine={phrasal} /> : null}
        <div className={s.foot}>
          <Link className={s.link} href={"/dashboard/word-book" as Route}>
            {day.wordBookDue > 0 ? `Word book · ${day.wordBookDue} to review today` : "Your word book"}
            <ArrowIcon className={s.arrow} />
          </Link>
          <span>New ones at midnight</span>
        </div>
      </section>
    </div>
  );
}

function PhrasalRow({ mine }: { mine: MyCard }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  return (
    <div className={s.pv}>
      <button type="button" className={s.pvHead} aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((value) => !value)}>
        <span className={s.pvText}>
          <span className={s.pvLabel}>Phrasal verb of the day</span>
          <span className={s.pvName}>{mine.card.headword}</span>
        </span>
        <ChevronIcon className={s.chev} />
      </button>
      <div id={bodyId} className={s.pvBody} hidden={!open}>
        {open ? <CardPart field="phrasalVerb" mine={mine} compact /> : null}
      </div>
    </div>
  );
}

function CardPart({ field, mine, compact = false }: { field: Field; mine: MyCard; compact?: boolean }) {
  const queryClient = useQueryClient();
  const card = mine.card;
  const question = mine.question;
  const tap = mine.stressTap;
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [explain, setExplain] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [lastStep, setLastStep] = useState<"knew" | "pick" | null>(null);

  const save = useMutation({
    mutationFn: (body: Omit<AttemptBody, "date" | "kind">) => sendWordAttempt({ date: mine.date, kind: card.kind, ...body }),
    onSuccess: (next, body) => {
      setJustAdded(next.addedToWordBook);
      setLastStep(body.pickedOption ? "pick" : body.knewIt !== undefined ? "knew" : null);
      queryClient.setQueryData<MyWordDay>(wordKeys.myDay, (old) => (old ? { ...old, [field]: next } : old));
    },
  });

  const stressOpen = Boolean(tap && tap.pick === null);
  const meaningShown = shown || mine.knewIt !== null;
  const answered = Boolean(question?.picked);
  const questionOpen = open || answered;
  const year = question ? card.cameOut.years[0] ?? null : null;
  const picked = question?.picked ?? null;
  const rightOption = question?.options.find((option) => option.letter === question.correctOption) ?? null;

  const knewMessage = mine.knewIt === false
    ? comesBackLine(mine.date)
    : mine.knewIt === true
      ? "Good. Try the JAMB question to be sure."
      : "";

  return (
    <div className={s.part}>
      {compact ? null : (
        <>
          <div className={s.dtop}>
            <span>{KIND_OF_THE_DAY[card.kind]}</span>
            <span className={s.pill}>{yearPill(card.cameOut)}</span>
          </div>
          <p className={cn(s.dw, card.kind !== "WORD" && s.dwSmall)}>{card.headword}</p>
        </>
      )}

      {stressOpen && tap ? (
        <div className={s.stress}>
          <p className={s.sq} id={`${card.slug}-stress`}>Which part is stressed? Tap it.</p>
          <div className={s.syls} role="group" aria-labelledby={`${card.slug}-stress`}>
            {tap.syllables.map((syllable, index) => (
              <button key={`${syllable}-${index}`} type="button" className={s.syl} disabled={save.isPending} onClick={() => save.mutate({ stressPick: index })}>
                {syllable}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className={s.dsay}>
            {[
              card.sayAs ? <SayAs key="say" text={card.sayAs} /> : null,
              card.ipa ? <span key="ipa" className={s.ipa} style={{ fontSize: 14 }}>{card.ipa}</span> : null,
              card.partOfSpeech ? <span key="pos">{card.partOfSpeech}</span> : null,
            ]
              .filter(Boolean)
              .flatMap((node, index) => (index === 0 ? [node] : [<span key={`dot-${index}`}> · </span>, node]))}
          </p>
          {tap && tap.pick !== null && tap.stressIndex !== null ? (
            <p className={cn(s.snote, tap.correct ? s.ok : s.no)} aria-live="polite">
              {tap.correct
                ? `Right. The stress is on ${tap.syllables[tap.stressIndex].toUpperCase()}.`
                : `Not quite. The stress is on ${tap.syllables[tap.stressIndex].toUpperCase()}, not ${tap.syllables[tap.pick].toUpperCase()}.`}
            </p>
          ) : null}
        </>
      )}

      {meaningShown ? (
        <>
          <p className={s.dmean}>{card.meaning}</p>
          {card.examples[0] ? <p className={s.deg}>“{card.examples[0]}”</p> : null}
          {mine.knewIt === null ? (
            <div className={s.knew}>
              <span>Did you know it?</span>
              <button type="button" className={cn(s.btn2, s.small)} disabled={save.isPending} onClick={() => save.mutate({ knewIt: true })}>I knew it</button>
              <button type="button" className={cn(s.btn2, s.small)} disabled={save.isPending} onClick={() => save.mutate({ knewIt: false })}>Not yet</button>
            </div>
          ) : (
            <p className={s.kmsg} aria-live="polite">{knewMessage}</p>
          )}
        </>
      ) : (
        <div className={s.guess}>
          <p>What does it mean? Think of your answer first.</p>
          <button type="button" className={cn(s.btn2, s.small)} onClick={() => setShown(true)}>Show the meaning</button>
        </div>
      )}

      {question && meaningShown ? (
        questionOpen ? (
          <div className={s.dq}>
            <p className={s.dqh}>{year ? `JAMB UTME ${year}` : "JAMB UTME"} · Use of English</p>
            {card.question?.instruction ? <p className={s.dqi}>{card.question.instruction}</p> : null}
            {card.question ? <p className={s.dqs}><Sentence text={card.question.sentence} /></p> : null}
            <div className={s.opts} role="group" aria-label="Options">
              {question.options.map((option) => {
                const isRight = answered && option.letter === question.correctOption;
                const isWrong = answered && option.letter === picked && !question.isCorrect;
                return (
                  <button
                    key={option.letter}
                    type="button"
                    className={cn(s.opt, isRight && s.right, isWrong && s.wrong, answered && !isRight && !isWrong && s.dim)}
                    disabled={answered || save.isPending}
                    onClick={() => save.mutate({ pickedOption: option.letter as OptionLetter })}
                  >
                    <span className={s.bub}>{option.letter}</span>
                    <span className={s.otx}>{option.text}</span>
                    {isRight ? <TickIcon className={s.om} /> : null}
                    {isWrong ? <CrossIcon className={s.om} /> : null}
                  </button>
                );
              })}
            </div>
            <div aria-live="polite">
              {answered ? (
                <div className={cn(s.res, question.isCorrect ? s.ok : s.no)}>
                  <p className={s.rh}>
                    {question.isCorrect
                      ? "Right."
                      : `Not this one. The answer is ${question.correctOption}${rightOption ? `, ${rightOption.text}` : ""}.`}
                  </p>
                  {question.trapNote || question.answerNote ? <p>{question.trapNote ?? question.answerNote}</p> : null}
                  {justAdded && lastStep === "pick" && mine.knewIt === true ? (
                    <p className={s.kmsg}>You said you knew it, so we&apos;ve added it to your word book to be safe.</p>
                  ) : null}
                  {question.stat?.correctPercent != null ? (
                    <p className={cn(s.stat, s.tn)}>{question.stat.correctPercent}% of StudyBond students got this right.</p>
                  ) : null}
                  <div className={s.links}>
                    {question.explanation ? (
                      <button type="button" className={s.link} aria-expanded={explain} onClick={() => setExplain((value) => !value)}>
                        {explain ? "Hide the explanation" : "Read the full explanation"}
                      </button>
                    ) : null}
                    <Link className={s.link} href={"/dashboard/study" as Route}>
                      Practise more English questions
                      <ArrowIcon className={s.arrow} />
                    </Link>
                  </div>
                  {explain && question.explanation ? (
                    <div className={cn(s.expl, "sb-protected")}>
                      <MathMarkdown content={question.explanation.text} variant="explanation" />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <button type="button" className={cn(s.btn2, s.dtry)} onClick={() => setOpen(true)}>
            {questionLabel(year)}
          </button>
        )
      ) : null}

      {save.isError ? <p className={s.err} role="alert">We couldn&apos;t save that. Check your connection and try again.</p> : null}
    </div>
  );
}
