"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { getUserProfile } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

import { getWordBook, sendWordReview, wordKeys } from "../api";
import { KIND_LABEL, dueLabel } from "../lib/words";
import type { BookRow, DueWord, ReviewResult, WordBook } from "../types";
import s from "../words.module.css";
import { ArrowIcon, CrossIcon, TickIcon } from "./bits";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * /dashboard/word-book (mockup boards "Word book"): today's quick checks, one
 * at a time, then the lists. "Not yet" cards come back after 1, 3, 7 and 21
 * days; a miss sends a card back to the first check. Saving words from
 * practice is premium.
 */
export function WordBookPage() {
  return (
    <LearnerShell>
      <WordBookContent />
    </LearnerShell>
  );
}

/** The page inside the app's frame. */
export function WordBookContent() {
  const book = useQuery({ queryKey: wordKeys.book, queryFn: getWordBook, retry: 1 });
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, staleTime: 5 * 60_000 });

  return (
    <div className={cn("sb-ui", s.book)}>
      <div className={s.bookIn}>
        <Link className={s.ghost} href={"/dashboard" as Route} style={{ paddingLeft: 0 }}>
          <ArrowIcon className={s.arrow} back />
          Dashboard
        </Link>
        <h1 style={{ marginTop: 12 }}>Word book</h1>
        <p className={s.sub}>
          Words you marked “Not yet” come back on the day they&apos;re due. Get a word right at all four checks, over about a month, and it&apos;s learnt.
        </p>
        {book.isLoading ? (
          <div className={s.bookGrid}>
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        ) : book.isError || !book.data ? (
          <div style={{ marginTop: 28 }}>
            <ErrorState title="We couldn't load your word book" description="Please try again." actionLabel="Retry" onAction={() => book.refetch()} />
          </div>
        ) : (
          <BookBody book={book.data} isPremium={profile.data?.isPremium ?? false} />
        )}
      </div>
    </div>
  );
}

function BookBody({ book, isPremium }: { book: WordBook; isPremium: boolean }) {
  return (
    <div className={s.bookGrid}>
      <Review book={book} />
      <div className={s.wlist}>
        <section aria-labelledby="wl-learning">
          <h2 id="wl-learning">Learning <span className={s.tn}>{book.learning.length}</span></h2>
          {book.learning.length ? (
            <ul className={s.rows}>
              {book.learning.map((row) => <Row key={row.cardId} row={row} today={book.today} />)}
            </ul>
          ) : (
            <p className={s.empty}>Nothing here yet. Tap “Not yet” on a dashboard card, and the word joins your word book.</p>
          )}
        </section>
        <section aria-labelledby="wl-learnt">
          <h2 id="wl-learnt">Learnt <span className={s.tn}>{book.learnt.length}</span></h2>
          {book.learnt.length ? (
            <ul className={s.rows}>
              {book.learnt.map((row) => <Row key={row.cardId} row={row} today={book.today} />)}
            </ul>
          ) : (
            <p className={s.empty}>Nothing yet. A word counts as learnt once you get it right at its last check, 21 days after the one before.</p>
          )}
        </section>
        <section aria-labelledby="wl-saved">
          <h2 id="wl-saved">Saved from practice</h2>
          {book.saved.length ? (
            <ul className={s.rows}>
              {book.saved.map((row) => <Row key={row.cardId} row={row} today={book.today} />)}
            </ul>
          ) : isPremium ? (
            <p className={s.empty}>When a practice question tests a word we have a card for, you can save it, and it joins your word book.</p>
          ) : (
            <div className={s.lock}>
              <p>With premium, you can save any word JAMB tested while you practise, and it joins your word book.</p>
              <Link className={cn(s.btn2, s.small)} href={"/dashboard/settings?tab=subscription" as Route}>See premium</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ row, today }: { row: BookRow; today: string }) {
  const due = row.learntAt ? "Learnt" : dueLabel(today, row.dueOn);
  const from = row.savedFrom?.year ? ` · saved from ${row.savedFrom.board ?? "JAMB"} ${row.savedFrom.year}` : "";
  return (
    <li className={s.row}>
      <span style={{ minWidth: 0 }}>
        <b>{row.headword}</b>
        <small>{KIND_LABEL[row.kind]}{from}</small>
      </span>
      <span className={cn(s.due, due === "Today" && s.dueNow)}>
        {due}
        {row.nextCheck && !row.learntAt ? <small>Check {row.nextCheck} of {row.checks}</small> : null}
      </span>
    </li>
  );
}

/** Today's checks, one word at a time. The list stays as it loaded until the last one is done. */
function Review({ book }: { book: WordBook }) {
  const queryClient = useQueryClient();
  const [items] = useState<DueWord[]>(book.due);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<number, { choiceId: number; result: ReviewResult }>>({});

  const answer = useMutation({
    mutationFn: sendWordReview,
    onSuccess: (result, body) => setResults((old) => ({ ...old, [index]: { choiceId: body.choiceId, result } })),
  });

  const finish = () => {
    setIndex(items.length);
    void queryClient.invalidateQueries({ queryKey: wordKeys.book });
    void queryClient.invalidateQueries({ queryKey: wordKeys.myDay });
  };

  if (items.length === 0) {
    return (
      <section className={s.rev} aria-label="Today's review">
        <div className={s.rtop}><span>Due today</span><span className={s.tn}>0</span></div>
        <div className={s.rdone}>
          <h3>Nothing to review today</h3>
          <p>Words come back on the day they&apos;re due. Try today&apos;s cards on the dashboard.</p>
        </div>
      </section>
    );
  }

  if (index >= items.length) {
    const all = Object.values(results);
    const right = all.filter((entry) => entry.result.correct).length;
    const wrong = all.length - right;
    return (
      <section className={s.rev} aria-label="Today's review">
        <div className={s.rtop}><span>Due today</span><span className={s.tn}>Done</span></div>
        <div className={s.rdone} aria-live="polite">
          <h3>Done for today</h3>
          <p>
            {wrong === 0
              ? `All ${right} right. They move on to their next check.`
              : `${right} right, ${wrong} back tomorrow. You can try today's cards on the dashboard.`}
          </p>
        </div>
      </section>
    );
  }

  const item = items[index];
  const done = results[index];
  const result = done?.result ?? null;
  return (
    <section className={s.rev} aria-label="Today's review">
      <div className={s.rtop}><span>Due today</span><span className={s.tn}>{index + 1} of {items.length}</span></div>
      <p className={s.rk}>{KIND_LABEL[item.kind]}{item.partOfSpeech && item.kind === "WORD" ? ` · ${item.partOfSpeech}` : ""}</p>
      <p className={s.rw}>{item.headword}</p>
      <p className={s.rq}>What does it mean?</p>
      <div className={s.opts} role="group" aria-label="Meanings">
        {item.choices.map((choice, n) => {
          const isRight = Boolean(result) && choice.id === item.cardId;
          const isWrong = Boolean(result) && choice.id === done?.choiceId && !result?.correct;
          return (
            <button
              key={choice.id}
              type="button"
              className={cn(s.opt, isRight && s.right, isWrong && s.wrong, result && !isRight && !isWrong && s.dim)}
              disabled={Boolean(result) || answer.isPending}
              onClick={() => answer.mutate({ cardId: item.cardId, choiceId: choice.id })}
            >
              <span className={s.bub}>{LETTERS[n]}</span>
              <span className={s.otx}>{choice.text}</span>
              {isRight ? <TickIcon className={s.om} /> : null}
              {isWrong ? <CrossIcon className={s.om} /> : null}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {result ? (
          <>
            <div className={cn(s.res, result.correct ? s.ok : s.no)}>
              <p className={s.rh}>{result.correct ? (result.learnt ? "Right. That one is learnt." : "Right.") : "Not quite."}</p>
              <p>
                {result.correct
                  ? result.learnt
                    ? "It moves to your learnt words."
                    : `Next check: ${dueLabel(book.today, result.dueOn)}.`
                  : `It means: ${result.meaning} It comes back tomorrow.`}
              </p>
            </div>
            <button type="button" className={s.btn} onClick={() => (index + 1 >= items.length ? finish() : setIndex(index + 1))}>
              {index + 1 >= items.length ? "Finish" : "Next word"}
            </button>
          </>
        ) : null}
        {answer.isError ? <p className={s.err} role="alert">We couldn&apos;t save that. Check your connection and try again.</p> : null}
      </div>
    </section>
  );
}
