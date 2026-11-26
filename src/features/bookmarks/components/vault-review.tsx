"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { MediaNode } from "@/features/exam/components/answer-review";
import { SharedStimulus } from "@/features/exam/components/shared-stimulus";
import { caveat } from "@/features/home/home-fonts";
import { CloseIcon } from "@/features/home/icons";
import { useBookmarkById } from "@/features/bookmarks/hooks/use-bookmarks";
import { getBookmarkById, getBookmarks } from "@/lib/api/bookmarks";
import type { ExamProfileSubject } from "@/lib/api/institutions";
import { cn } from "@/lib/utils/cn";

import s from "../vault.module.css";
import { Explanation, Options, SubjectBadge, leftLine } from "./vault-card";

/*
 * "Go through them" (approved 2026-11-26): the saved questions one card at a
 * time, the ones going soonest first. The student picks an answer (or asks
 * to see it), then reads why. No score is saved and no SP is given.
 */
export function VaultReview({ subject, subjects, soonDays, onClose }: {
  subject: string | null;
  subjects: ExamProfileSubject[];
  soonDays: number;
  onClose: () => void;
}) {
  const deck = useQuery({
    queryKey: ["bookmarks", "review", subject],
    queryFn: () => getBookmarks({ page: 1, limit: 50, subject: subject ?? undefined, sort: "soon" }),
    staleTime: 60_000,
  });
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [knew, setKnew] = useState(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const cards = deck.data?.bookmarks ?? [];
  const done = cards.length > 0 && idx >= cards.length;
  const listCard = cards[Math.min(idx, cards.length - 1)];
  /* The deck holds the order; each card is fetched whole (options, answer,
     explanation) when it comes up, and the next one is fetched ahead. */
  const full = useBookmarkById(listCard?.id ?? 0, !!listCard && !done);
  const card = full.data && full.data.id === listCard?.id ? full.data : null;
  const q = card?.question;
  const qc = useQueryClient();
  const nextId = cards[idx + 1]?.id;
  useEffect(() => {
    if (nextId) void qc.prefetchQuery({ queryKey: ["bookmark", nextId], queryFn: () => getBookmarkById(nextId) });
  }, [nextId, qc]);

  function pick(letter: string) {
    if (shown || !q) return;
    setPicked(letter);
    setShown(true);
    if (letter === q.correctAnswer) setKnew((k) => k + 1);
  }
  function next() {
    setIdx((i) => i + 1);
    setPicked(null);
    setShown(false);
  }
  function again() {
    setIdx(0);
    setPicked(null);
    setShown(false);
    setKnew(0);
  }

  const left = card ? leftLine(card.expiresAt, soonDays) : null;
  const sheet = (
    <div className={cn("sb-ui", caveat.variable)}>
      <div className={s.sheetWrap} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className={s.sheet} role="dialog" aria-modal="true" aria-label="Go through your saved questions">
          <div className={s.shTop}>
            <b>{done || !cards.length ? "Your saved questions" : <>Card <span>{idx + 1}</span> of <span>{cards.length}</span></>}</b>
            <button type="button" className={s.close} aria-label="Close" onClick={onClose}><CloseIcon /></button>
          </div>
          {cards.length > 1 && !done ? (
            <div className={s.track} aria-hidden="true">
              {cards.slice(0, 50).map((c, i) => <i key={c.id} className={cn(i < idx && s.done, i === idx && s.now)} />)}
            </div>
          ) : null}

          <div className={s.pile}>
            {deck.isLoading || (listCard && !done && !card && !full.isError) ? <div className={s.skel} /> : null}
            {full.isError && !done ? <p className={s.noHit}>This card didn't load. Check your connection.</p> : null}
            {deck.isError ? <p className={s.noHit}>The cards didn&rsquo;t load. Check your connection.</p> : null}
            {deck.data && cards.length === 0 ? <p className={s.noHit}>Nothing saved here yet.</p> : null}
            {done ? (
              <div className={s.doneCard}>
                <h3>That&rsquo;s all {cards.length}.</h3>
                <p>You knew {knew} of them. Nothing here counts for SP, so go again whenever you like.</p>
              </div>
            ) : q && card ? (
              <article className={s.card} key={card.id}>
                <div className={s.cHead}>
                  <span className={s.cSub}><SubjectBadge name={q.subject} list={subjects} />{q.subject}{q.topic ? <em>· {q.topic}</em> : null}</span>
                  {left ? <span className={cn(s.left, left.soon && s.leftSoon)}>{left.text}</span> : null}
                </div>
                <div className={s.cBody}>
                  <SharedStimulus compact text={q.parentQuestionText} imageUrl={q.parentQuestionImageUrl} />
                  <div className={cn(s.cQ, "sb-protected")}><MathMarkdown content={q.questionText} variant="option" /></div>
                  {q.imageUrl ? <MediaNode url={q.imageUrl} alt="Question" className="mt-2 max-h-48 rounded-xl" /> : null}
                  {card.notes && shown ? <p className={s.note}>{card.notes}</p> : null}
                  <Options q={q} show={shown} picked={picked} onPick={pick} />
                  {shown ? <Explanation q={q} /> : null}
                </div>
              </article>
            ) : null}
          </div>

          <div className={s.shFoot}>
            {done ? (
              <>
                <button type="button" className={cn(s.btn, s.btn2)} onClick={onClose}>Close</button>
                <button type="button" className={s.btn} onClick={again}>Go again</button>
              </>
            ) : q ? (
              shown ? (
                <button type="button" className={s.btn} onClick={next}>{idx + 1 < cards.length ? "Next card" : "Finish"}</button>
              ) : (
                <button type="button" className={cn(s.btn, s.btn2)} onClick={() => setShown(true)}>Just show me the answer</button>
              )
            ) : (
              <button type="button" className={cn(s.btn, s.btn2)} onClick={onClose}>Close</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document === "undefined" ? null : createPortal(sheet, document.body);
}
