"use client";

import { useState } from "react";

import type { ExamProfileSubject } from "@/lib/api/institutions";
import type { Department } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { SubjectTile } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import p from "./picker.module.css";
import u from "./setup.module.css";

/* Picking from many subjects (mockup board 9). Boards with more than 8
   subjects (JAMB) get a "Your paper" strip, search with aliases and
   Science / Art / Commercial tabs that open on the student's department.
   Subjects in more than one department show in each tab; subjects that
   share a pickerGroup (the languages) fold into one row. */

/** The exam profile sends these since duel phase two (2026-11-08). */
type PickerSubject = ExamProfileSubject & {
  departments?: Department[];
  pickerGroup?: string | null;
};

const BIG_BOARD = 8;
const TAB_ORDER: Department[] = ["SCIENCE", "ART", "COMMERCIAL"];
const TAB_NAME: Record<Department, string> = { SCIENCE: "Science", ART: "Art", COMMERCIAL: "Commercial" };

export function useNeedsBigPicker(subjects: ExamProfileSubject[]): boolean {
  return subjects.length > BIG_BOARD;
}

/** The shortest sensible label for a slot: "Principles of Accounts" -> "Accounts". */
function shortLabel(subject: ExamProfileSubject): string {
  const options = [subject.name, ...subject.aliases].filter((label) => label.length >= 3 && !/^[A-Z]{2,4}$/.test(label));
  return options.reduce((best, label) => (label.length < best.length ? label : best), subject.name);
}

function inEveryTab(subject: PickerSubject) {
  return subject.isCompulsory || !subject.departments || subject.departments.length === 0;
}

function inTab(subject: PickerSubject, tab: Department) {
  return inEveryTab(subject) || Boolean(subject.departments?.includes(tab));
}

export function BigSubjectPicker({
  subjects,
  picked,
  max,
  department,
  taster,
  onToggle,
  nudge,
}: {
  subjects: PickerSubject[];
  picked: string[];
  max: number;
  department: Department | null;
  taster: boolean;
  onToggle: (name: string) => void;
  nudge: string | null;
}) {
  const [tab, setTab] = useState<Department>(department ?? "SCIENCE");
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const byName = new Map(subjects.map((subject) => [subject.name, subject]));
  const q = query.trim().toLowerCase();

  function row(subject: PickerSubject) {
    const order = picked.indexOf(subject.name);
    const on = order >= 0;
    const full = !taster && !on && picked.length >= max;
    const others = (subject.departments ?? []).filter((d) => d !== tab).map((d) => TAB_NAME[d]);
    const count = taster ? 15 : subject.questionCount;
    const note = on
      ? taster ? `Your taster subject · ${count} questions` : `Subject ${order + 1} on your paper`
      : subject.isCompulsory
        ? `Most students take it · ${count} questions`
        : others.length > 0 && !q
          ? `Also in ${others.join(" and ")}`
          : `${count} questions`;
    return (
      <button
        key={subject.name}
        type="button"
        className={cn(u.srow, p.srow, on && u.on, full && u.full, nudge === subject.name && u.nudge)}
        aria-pressed={on}
        aria-disabled={full}
        onClick={() => onToggle(subject.name)}
      >
        <SubjectTile iconName={subject.iconName} code={subject.code} colorToken={subject.colorToken} size={36} />
        <span className={u.stext}>
          <b className={p.ellipsis}>{subject.name}</b>
          <small>{note}</small>
        </span>
        <span className={u.mark} aria-hidden="true">{on ? order + 1 : <Plus />}</span>
      </button>
    );
  }

  const tabSubjects = subjects.filter((subject) => inTab(subject, tab));
  const first = tabSubjects.filter((subject) => subject.isCompulsory);
  const rest = tabSubjects.filter((subject) => !subject.isCompulsory);
  const groups = new Map<string, PickerSubject[]>();
  const plain: PickerSubject[] = [];
  for (const subject of rest) {
    if (subject.pickerGroup) groups.set(subject.pickerGroup, [...(groups.get(subject.pickerGroup) ?? []), subject]);
    else plain.push(subject);
  }

  const results = q
    ? subjects.filter((subject) =>
        [subject.name, subject.code, ...subject.aliases, subject.pickerGroup ?? ""].join(" ").toLowerCase().includes(q),
      )
    : [];

  const slots = Array.from({ length: max }, (_, index) => picked[index] ?? null);

  return (
    <div className={p.picker}>
      <div className={p.slots} style={{ gridTemplateColumns: `repeat(${Math.max(max, 1)}, minmax(0, 1fr))` }} aria-label="Subjects on your paper">
        {slots.map((nameOf, index) =>
          nameOf && byName.get(nameOf) ? (
            <button
              key={nameOf}
              type="button"
              className={cn(p.slot, p.slotOn)}
              aria-label={`Remove ${nameOf}`}
              onClick={() => onToggle(nameOf)}
            >
              <span className={p.n}>{index + 1}</span>
              <span className={p.x} aria-hidden="true"><Cross /></span>
              <SubjectTile
                iconName={byName.get(nameOf)!.iconName}
                code={byName.get(nameOf)!.code}
                colorToken={byName.get(nameOf)!.colorToken}
                size={32}
              />
              <span className={p.slName}>{shortLabel(byName.get(nameOf)!)}</span>
            </button>
          ) : (
            <div key={`empty-${index}`} className={cn(p.slot, p.slotEmpty)}>
              <span className={p.plus}>+</span>
              <small>Subject {index + 1}</small>
            </div>
          ),
        )}
      </div>

      <div className={p.searchbox}>
        <svg className={p.mag} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder={`Search ${subjects.length} subjects, e.g. Accounts`}
          aria-label="Search subjects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {q && (
          <button type="button" className={p.clear} aria-label="Clear search" onClick={() => setQuery("")}>
            <Cross />
          </button>
        )}
      </div>

      {!q ? (
        <>
          <div className={p.tabs} role="group" aria-label="Department">
            {TAB_ORDER.map((d) => {
              const count = subjects.filter((subject) => !subject.isCompulsory && inTab(subject, d)).length;
              const on = tab === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={cn(on && p.tabOn)}
                  aria-pressed={on}
                  onClick={() => {
                    playDuelSound("tap");
                    setTab(d);
                  }}
                >
                  <b>{TAB_NAME[d]}</b>
                  <small>{d === department ? `Yours · ${count}` : `${count} subjects`}</small>
                </button>
              );
            })}
          </div>
          <p className={p.deptNote}>
            {tab === department
              ? "Opens on your department. Subjects in more than one department show in each."
              : "Subjects from another department are fine too."}
          </p>
          <div className={cn(u.slist, p.list)}>
            {first.map(row)}
            {plain.map(row)}
            {[...groups.entries()].map(([group, members]) => {
              const open = Boolean(openGroups[group]) || members.some((member) => picked.includes(member.name));
              const pickedHere = members.filter((member) => picked.includes(member.name)).map((member) => member.name);
              return (
                <div key={group} className={p.groupWrap}>
                  <button
                    type="button"
                    className={cn(p.grouprow, open && p.open)}
                    aria-expanded={open}
                    onClick={() => {
                      playDuelSound("tap");
                      setOpenGroups({ ...openGroups, [group]: !openGroups[group] });
                    }}
                  >
                    <span className={p.gi} aria-hidden="true">{members.length}</span>
                    <span className={u.stext}>
                      <b className={p.ellipsis}>{group}</b>
                      <small>{pickedHere.length ? `${pickedHere.join(", ")} picked` : members.map((member) => member.name).join(", ")}</small>
                    </span>
                    <span className={p.chev} aria-hidden="true"><Chevron /></span>
                  </button>
                  {open && <div className={p.nested}>{members.map(row)}</div>}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className={p.resultsH}>{results.length === 1 ? "1 subject" : `${results.length} subjects`}</p>
          {results.length > 0 ? (
            <div className={cn(u.slist, p.list)}>{results.map(row)}</div>
          ) : (
            <div className={p.emptyMsg}>No subject matches &ldquo;{query.trim()}&rdquo;. Try a shorter word, like &ldquo;lit&rdquo; or &ldquo;agric&rdquo;.</div>
          )}
        </>
      )}
    </div>
  );
}

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
    <path d="M12 6v12M6 12h12" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
