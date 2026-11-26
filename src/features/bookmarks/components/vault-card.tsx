"use client";

import { useState } from "react";
import { toast } from "sonner";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { SubjectIcon, subjectPalette } from "@/components/ui/subject-icon";
import { useBookmarkById, useDeleteBookmark, useUpdateBookmarkNotes } from "@/features/bookmarks/hooks/use-bookmarks";
import { MediaNode } from "@/features/exam/components/answer-review";
import { SharedStimulus } from "@/features/exam/components/shared-stimulus";
import { BinIcon, CrossIcon, PenIcon, TickIcon } from "@/features/home/icons";
import type { ExamProfileSubject } from "@/lib/api/institutions";
import type { Bookmark, BookmarkQuestion } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "../vault.module.css";

const LETTERS = ["A", "B", "C", "D", "E"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function findSubject(name: string, list: ExamProfileSubject[]): ExamProfileSubject | undefined {
  const x = name.trim().toLowerCase();
  return list.find((b) => b.name.toLowerCase() === x || b.aliases.some((al) => al.toLowerCase() === x));
}

export function SubjectBadge({ name, list }: { name: string; list: ExamProfileSubject[] }) {
  const subj = findSubject(name, list);
  return (
    <span className={s.ico} aria-hidden="true">
      {subj ? <SubjectIcon iconName={subj.iconName} code={subj.code} size={14} className={subjectPalette(subj.colorToken).text} /> : name.slice(0, 3)}
    </span>
  );
}

/** "Goes tomorrow", "Goes in 2 days", "19 days left". Amber at soonDays or less. */
export function leftLine(expiresAt: string | null, soonDays: number, now = Date.now()): { text: string; soon: boolean } {
  if (!expiresAt) return { text: "Kept", soon: false };
  const days = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / DAY_MS));
  const soon = days <= soonDays;
  if (days <= 0) return { text: "Goes today", soon };
  if (days === 1) return { text: "Goes tomorrow", soon };
  if (soon) return { text: `Goes in ${days} days`, soon };
  return { text: `${days} days left`, soon };
}

function savedOn(iso: string): string {
  const d = new Date(Date.parse(iso) + 60 * 60 * 1000);
  return `Saved ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** The options, with the right one ticked (and the student's pick when it was wrong). */
export function Options({ q, show, picked, onPick }: {
  q: BookmarkQuestion;
  show: boolean;
  picked?: string | null;
  onPick?: (letter: string) => void;
}) {
  return (
    <div className={s.opts}>
      {LETTERS.map((l) => {
        const text = q[`option${l}` as const];
        const img = q[`option${l}ImageUrl` as const];
        if (!text && !img) return null;
        const ok = show && q.correctAnswer === l;
        const no = show && picked === l && q.correctAnswer !== l;
        const body = (
          <>
            <b>{l}</b>
            <span>
              {text ? <MathMarkdown content={text} variant="option" /> : null}
              {img ? <MediaNode url={img} alt={`Option ${l}`} className="mt-1 max-h-24 rounded-lg" /> : null}
            </span>
            {ok ? <TickIcon /> : no ? <CrossIcon /> : <span />}
          </>
        );
        const cls = cn(s.opt, ok && s.optOk, no && s.optNo);
        return onPick && !show ? (
          <button key={l} type="button" className={cls} onClick={() => onPick(l)}>{body}</button>
        ) : (
          <div key={l} className={cls}>{body}</div>
        );
      })}
    </div>
  );
}

export function Explanation({ q }: { q: BookmarkQuestion }) {
  const [all, setAll] = useState(false);
  const right = q.correctAnswer;
  const rightText = q[`option${right as (typeof LETTERS)[number]}` as const];
  return (
    <div className={cn(s.expl, all && s.explOpen)}>
      <b>The answer is {right}{rightText && rightText.length < 70 ? `: ${rightText.replace(/\$/g, "")}` : ""}.</b>
      {q.explanation?.text ? (
        <>
          <div className={cn(s.explBody, "sb-protected")}><MathMarkdown content={q.explanation.text} variant="explanation" /></div>
          {q.explanation.imageUrl && all ? <MediaNode url={q.explanation.imageUrl} alt="Explanation" className="mt-2 max-h-40 rounded-lg" /> : null}
          <button type="button" className={s.linkBtn} onClick={() => setAll(!all)}>{all ? "Show less" : "Read the whole explanation"}</button>
        </>
      ) : null}
    </div>
  );
}

export function VaultCard({ bookmark: b, subjects, soonDays }: { bookmark: Bookmark; subjects: ExamProfileSubject[]; soonDays: number }) {
  const [open, setOpen] = useState(false);
  /* The list carries the question only; options, answer and explanation come
     with the full card, fetched when the student opens it. */
  const full = useBookmarkById(b.id, open);
  const q = full.data?.question ?? b.question;
  const ready = open && !!full.data;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(b.notes ?? "");
  const [asking, setAsking] = useState(false);
  const save = useUpdateBookmarkNotes();
  const remove = useDeleteBookmark();
  const left = leftLine(b.expiresAt, soonDays);

  async function saveNote() {
    const text = draft.trim();
    try {
      await save.mutateAsync({ bookmarkId: b.id, notes: text ? text.slice(0, 2000) : null });
      setEditing(false);
    } catch {
      toast.error("Your note didn't save. Check your connection and try again.");
    }
  }

  async function takeOut() {
    try {
      await remove.mutateAsync(b.id);
      toast.success("Taken out of your vault.");
    } catch {
      toast.error("It's still in your vault. Check your connection and try again.");
      setAsking(false);
    }
  }

  return (
    <article className={s.card}>
      <div className={s.cHead}>
        <span className={s.cSub}>
          <SubjectBadge name={q.subject} list={subjects} />
          {q.subject}
          {q.topic ? <em>· {q.topic}</em> : null}
        </span>
        <span className={cn(s.left, left.soon && s.leftSoon)}>{left.text}</span>
      </div>
      <div className={s.cBody}>
        {ready ? <SharedStimulus compact text={q.parentQuestionText} imageUrl={q.parentQuestionImageUrl} /> : null}
        <div className={cn(s.cQ, !open && s.clamp, "sb-protected")}><MathMarkdown content={q.questionText} variant="option" /></div>
        {q.imageUrl && ready ? <MediaNode url={q.imageUrl} alt="Question" className="mt-2 max-h-48 rounded-xl" /> : null}
        {!open && q.hasImage ? <p className={s.pic}>Comes with a picture. Tap See answer to open it.</p> : null}

        {editing ? (
          <div className={s.noteEdit}>
            <label className="sr-only" htmlFor={`note-${b.id}`}>Your note</label>
            <textarea id={`note-${b.id}`} value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} placeholder="Write what you want to remember" autoFocus />
            <div className={s.noteActs}>
              <button type="button" className={cn(s.btn, s.btn2)} onClick={() => { setEditing(false); setDraft(b.notes ?? ""); }}>Cancel</button>
              <button type="button" className={s.btn} onClick={saveNote} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save note"}</button>
            </div>
          </div>
        ) : b.notes ? (
          <p className={s.note}>{b.notes}</p>
        ) : null}

        {ready ? (
          <>
            <Options q={q} show />
            <Explanation q={q} />
          </>
        ) : open ? (
          <p className={s.pic}>{full.isError ? "The answer didn't load. Check your connection." : "Opening the answer…"}</p>
        ) : null}
      </div>
      {asking ? (
        <div className={s.confirm} role="group" aria-label="Take it out?">
          <span>Take this question out of your vault?</span>
          <div>
            <button type="button" className={cn(s.btn, s.btn2)} onClick={() => setAsking(false)}>Keep</button>
            <button type="button" className={cn(s.btn, s.danger)} onClick={takeOut} disabled={remove.isPending}>{remove.isPending ? "…" : "Take out"}</button>
          </div>
        </div>
      ) : (
        <div className={s.cFoot}>
          <small>{savedOn(b.createdAt)}</small>
          <button type="button" className={cn(s.cBtn, open && s.cBtnOn)} onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide answer" : "See answer"}</button>
          <button type="button" className={cn(s.cBtn, s.iconBtn)} onClick={() => setEditing(true)} aria-label={b.notes ? "Change your note" : "Write a note"}><PenIcon /></button>
          <button type="button" className={cn(s.cBtn, s.iconBtn)} onClick={() => setAsking(true)} aria-label="Take it out of the vault"><BinIcon /></button>
        </div>
      )}
    </article>
  );
}
