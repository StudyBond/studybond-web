"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { getMyWordDay, sendWordAttempt, wordKeys } from "@/features/words/api";
import { sayParts, sentenceParts } from "@/features/words/lib/words";
import type { AttemptBody, MyCard, MyWordDay, OptionLetter, WordCardView, WordDay } from "@/features/words/types";

import { shortDate } from "./format";
import { ChevronDown, ChevronRight, CrossIcon, SpeakerIcon, TickIcon } from "./icons";
import { speakBritish, useBritishVoice } from "./use-home";
import s from "./home.module.css";

type Field = "word" | "idiom" | "phrasalVerb";
const LABEL: Record<Field, string> = { word: "Word", idiom: "Idiom", phrasalVerb: "Phrasal verb" };

/* The public day has the stress and IPA even before the stress tap, so
   "Just show me" can skip the tap without saving anything. */
async function getPublicDay() {
  const response = await apiClient<SuccessEnvelope<WordDay>>("/api/word-of-the-day");
  return response.data;
}

/**
 * "Today's words" (canvas Version 10): word, idiom and phrasal verb as
 * collapsed rows right under Next up. A tap opens the stress and British
 * IPA, the real sentence with the tested words underlined, a tip, Hear and
 * the real question. Words with syllables offer the stress tap first, but
 * "Just show me" skips it.
 */
export function WordsCard({ className, defaultOpen = null }: { className?: string; defaultOpen?: Field | null }) {
  const query = useQuery({ queryKey: wordKeys.myDay, queryFn: getMyWordDay, staleTime: 60_000, retry: 1 });
  const [open, setOpen] = useState<Field | null>(defaultOpen);
  const voice = useBritishVoice();
  const day = query.data;
  if (!day) return null;
  const rows = (["word", "idiom", "phrasalVerb"] as Field[])
    .map((field) => ({ field, mine: day[field] ?? null }))
    .filter((row): row is { field: Field; mine: MyCard } => row.mine !== null);
  if (rows.length === 0) return null;

  return (
    <section className={cn(s.words, className)} aria-label="Today's words">
      <div className={s.wHead}>
        <h3>Today&rsquo;s words</h3>
        <span>{shortDate(day.date)}</span>
      </div>
      {rows.map(({ field, mine }) => (
        <WordRow
          key={field}
          field={field}
          mine={mine}
          open={open === field}
          onToggle={() => setOpen((current) => (current === field ? null : field))}
          voice={voice}
        />
      ))}
    </section>
  );
}

function WordRow({ field, mine, open, onToggle, voice }: {
  field: Field;
  mine: MyCard;
  open: boolean;
  onToggle: () => void;
  voice: SpeechSynthesisVoice | null;
}) {
  const queryClient = useQueryClient();
  const card = mine.card;
  const tap = mine.stressTap;
  const [skipped, setSkipped] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  const stressPending = Boolean(tap && tap.pick === null) && !skipped;

  const publicDay = useQuery({ queryKey: ["words", "public-day"], queryFn: getPublicDay, enabled: skipped, staleTime: 60_000 });
  const publicCard: WordCardView | null = publicDay.data?.[field] ?? null;
  const sayAs = card.sayAs ?? (skipped ? publicCard?.sayAs ?? null : null);
  const ipa = card.ipa ?? (skipped ? publicCard?.ipa ?? null : null);

  const save = useMutation({
    mutationFn: (body: Omit<AttemptBody, "date" | "kind">) => sendWordAttempt({ date: mine.date, kind: card.kind, ...body }),
    onSuccess: (next) => {
      queryClient.setQueryData<MyWordDay>(wordKeys.myDay, (old) => (old ? { ...old, [field]: next } : old));
    },
  });

  const sentence = card.question?.sentence ?? null;
  const year = card.cameOut.years[0] ?? null;
  const board = card.cameOut.board === "JAMB" || !card.cameOut.board ? "UTME" : card.cameOut.board;
  const tip = card.opposite
    ? { b: `Opposite: ${card.opposite}.`, t: card.watchOut ?? "" }
    : card.closeTo
      ? { b: `Close to: ${card.closeTo}.`, t: card.watchOut ?? "" }
      : card.watchOut
        ? { b: "", t: card.watchOut }
        : card.comesFrom
          ? { b: "", t: card.comesFrom }
          : null;

  return (
    <div className={cn(s.wr, open && s.wrOn)}>
      <button type="button" className={s.wrBtn} onClick={onToggle} aria-expanded={open}>
        <span className={s.wrLab}>{LABEL[field]}</span>
        <span className={s.wrMain}>
          <b>{card.headword}</b>
          <small>{card.meaning}</small>
        </span>
        <ChevronDown className={s.wrChev} />
      </button>
      {open ? (
        <div className={s.wrMore}>
          {stressPending && tap ? (
            <div>
              <p className={s.stressQ} id={`${card.slug}-stress`}>Which part is stressed? Tap it.</p>
              <div className={s.syls} role="group" aria-labelledby={`${card.slug}-stress`}>
                {tap.syllables.map((syllable, index) => (
                  <button key={`${syllable}-${index}`} type="button" className={s.syl} disabled={save.isPending} onClick={() => save.mutate({ stressPick: index })}>
                    {syllable}
                  </button>
                ))}
                <button type="button" className={s.skip} onClick={() => setSkipped(true)}>Just show me</button>
              </div>
            </div>
          ) : (
            <div className={s.wrSay}>
              <div>
                <p className={s.say}>
                  {sayAs ? (
                    <span className={s.sy}>
                      {sayParts(sayAs).map((part, i) => (part.stressed ? <b key={i}>{part.text}</b> : <span key={i}>{part.text}</span>))}
                    </span>
                  ) : null}
                  {ipa ? <span className={s.ipa}>{ipa}</span> : null}
                  {card.partOfSpeech ? <i>{card.partOfSpeech}</i> : null}
                </p>
                {tap && tap.pick !== null && tap.stressIndex !== null ? (
                  <p className={cn(s.snote, tap.correct && s.snoteOk)} aria-live="polite">
                    {tap.correct
                      ? `Right. The stress is on ${tap.syllables[tap.stressIndex].toUpperCase()}.`
                      : `Not quite. The stress is on ${tap.syllables[tap.stressIndex].toUpperCase()}, not ${tap.syllables[tap.pick].toUpperCase()}.`}
                  </p>
                ) : null}
              </div>
              {voice ? (
                <button type="button" className={s.hear} onClick={() => speakBritish(voice, card.headword)} aria-label={`Hear ${card.headword} in a British voice`}>
                  <SpeakerIcon />
                </button>
              ) : null}
            </div>
          )}

          {sentence ? (
            <p className={s.eg}>
              &ldquo;{sentenceParts(sentence).map((part, i) => (part.underlined ? <u key={i}>{part.text}</u> : <span key={i}>{part.text}</span>))}&rdquo;
            </p>
          ) : card.examples[0] ? (
            <p className={s.eg}>&ldquo;{card.examples[0]}&rdquo;</p>
          ) : null}
          {tip ? (
            <p className={s.tip}>
              {tip.b ? <b>{tip.b}</b> : null}
              {tip.b && tip.t ? " " : null}
              {tip.t}
            </p>
          ) : null}

          {mine.question ? (
            tryOpen || mine.question.picked ? (
              <WordQuestion mine={mine} save={save} />
            ) : (
              <div className={s.wrFoot}>
                <span>{year ? `Came out in ${board} ${year}` : ""}</span>
                <button type="button" className={s.try} onClick={() => setTryOpen(true)}>
                  Try the question
                  <ChevronRight />
                </button>
              </div>
            )
          ) : year ? (
            <div className={s.wrFoot}><span>Came out in {board} {year}</span></div>
          ) : null}
          {save.isError ? <p className={s.err} role="alert">We couldn&apos;t save that. Check your connection and try again.</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function WordQuestion({ mine, save }: {
  mine: MyCard;
  save: { mutate: (body: Omit<AttemptBody, "date" | "kind">) => void; isPending: boolean };
}) {
  const [explain, setExplain] = useState(false);
  const question = mine.question!;
  const card = mine.card;
  const answered = Boolean(question.picked);
  const picked = question.picked;
  const right = question.options.find((option) => option.letter === question.correctOption) ?? null;
  const year = card.cameOut.years[0] ?? null;

  return (
    <div className={s.wq}>
      <p className={s.wqH}>{year ? `JAMB UTME ${year}` : "JAMB UTME"} · Use of English</p>
      {card.question?.instruction ? <p className={s.wqI}>{card.question.instruction}</p> : null}
      {card.question ? (
        <p className={s.wqS}>
          {sentenceParts(card.question.sentence).map((part, i) => (part.underlined ? <u key={i}>{part.text}</u> : <span key={i}>{part.text}</span>))}
        </p>
      ) : null}
      <div className={s.opts} role="group" aria-label="Options">
        {question.options.map((option) => {
          const isRight = answered && option.letter === question.correctOption;
          const isWrong = answered && option.letter === picked && !question.isCorrect;
          return (
            <button
              key={option.letter}
              type="button"
              className={cn(s.opt, isRight && s.optRight, isWrong && s.optWrong, answered && !isRight && !isWrong && s.optDim)}
              disabled={answered || save.isPending}
              onClick={() => save.mutate({ pickedOption: option.letter as OptionLetter })}
            >
              <span className={s.bub}>{option.letter}</span>
              <span>{option.text}</span>
              {isRight ? <TickIcon className={s.om} /> : isWrong ? <CrossIcon className={s.om} /> : <span />}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered ? (
          <div className={s.res}>
            <p className={s.resH}>
              {question.isCorrect ? "Right." : `Not this one. The answer is ${question.correctOption}${right ? `, ${right.text}` : ""}.`}
            </p>
            {question.trapNote || question.answerNote ? <p>{question.trapNote ?? question.answerNote}</p> : null}
            {question.stat?.correctPercent != null ? <p>{question.stat.correctPercent}% of StudyBond students got this right.</p> : null}
            {question.explanation ? (
              <button type="button" className={s.try} aria-expanded={explain} onClick={() => setExplain((v) => !v)}>
                {explain ? "Hide the explanation" : "Read the full explanation"}
              </button>
            ) : null}
            {explain && question.explanation ? (
              <div className="sb-protected">
                <MathMarkdown content={question.explanation.text} variant="explanation" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
