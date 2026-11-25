"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { acceptDuelChallenge, declineDuelChallenge } from "@/lib/api/duel";
import { caveat } from "@/features/home/home-fonts";
import { cn } from "@/lib/utils/cn";

import type { InboxItem, InboxNote, InboxNotice } from "./api";
import { clock, dateList, dayGroup, dayMonth, daysAgo, isOutsideLink, lagosMidnight, leftLabel, noteTime, untilLabel, type DayGroup } from "./format";
import { refreshNotifications, useInbox, useInboxActions, useThisDevice } from "./hooks";
import {
  BellIcon, BellOffIcon, CardIcon, ChevronDown, ChevronRight, ChevronUp, CloseIcon, PinIcon, SwordsIcon, TickIcon,
} from "./icons";
import { deviceWord } from "./push";
import s from "./notifications.module.css";

/* The inbox (boards 1, 1b, 5). Pinned notices on top, then "Needs you now"
   (still running out), then Today / Yesterday / Earlier. Notes stay 90 days. */

const SETTINGS = "/dashboard/settings?tab=notifications" as Route;
const CHALLENGE = "/dashboard/practice?mode=DAILY_CHALLENGE" as Route;

type Variant = "page" | "panel";

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function Inbox({ variant, pickedId, onLeave }: { variant: Variant; pickedId?: string | null; onLeave?: () => void }) {
  const inbox = useInbox();
  const now = useNow();
  const pages = inbox.data?.pages;

  if (inbox.isLoading) {
    return (
      <div className={s.skel} aria-busy="true" aria-label="Loading your notifications">
        <span /><span /><span />
      </div>
    );
  }
  if (!pages) {
    return (
      <div className={s.errorBox} role="alert">
        We couldn&apos;t load your notifications. Check your internet and try again.
        <div><button type="button" className={s.textBtn} onClick={() => void inbox.refetch()}>Try again</button></div>
      </div>
    );
  }

  const notices = pages[0]?.notices ?? [];
  const items = pages.flatMap((page) => page.items);
  const urgent = items.filter((item): item is InboxNote => item.type === "note" && item.urgent);
  const groups: Array<[DayGroup, InboxItem[]]> = (["Today", "Yesterday", "Earlier"] as DayGroup[])
    .map((name): [DayGroup, InboxItem[]] => [name, items.filter((item) => !(item.type === "note" && item.urgent) && dayGroup(item.createdAt, now) === name)])
    .filter(([, list]) => list.length > 0);
  const empty = notices.length === 0 && items.length === 0;
  const rowProps = { variant, now, pickedId: pickedId ?? null, onLeave };

  return (
    <div className={caveat.variable}>
      <AlertsOffBar />
      {empty ? (
        <Empty variant={variant} />
      ) : (
        <>
          {notices.length > 0 ? <NoticePile notices={notices} variant={variant} onLeave={onLeave} /> : null}
          {urgent.length > 0 ? (
            <>
              <div className={s.sec}>Needs you now <span className={s.num}>{clock(now)}</span></div>
              <ul className={s.list}>
                {urgent.map((note) => <NoteRow key={`n${note.id}`} note={note} {...rowProps} />)}
              </ul>
            </>
          ) : null}
          {groups.map(([name, list]) => (
            <div key={name}>
              <div className={s.sec}>{name}</div>
              <ul className={s.list}>
                {list.map((item) =>
                  item.type === "note"
                    ? <NoteRow key={`n${item.id}`} note={item} {...rowProps} />
                    : <ClosedNoticeRow key={`a${item.id}`} notice={item} {...rowProps} />,
                )}
              </ul>
            </div>
          ))}
          {inbox.hasNextPage ? (
            <div className={s.older}>
              <button type="button" className={s.ghost} onClick={() => void inbox.fetchNextPage()} disabled={inbox.isFetchingNextPage}>
                {inbox.isFetchingNextPage ? "Loading" : "Show older notes"}
              </button>
            </div>
          ) : null}
          <p className={s.foot}>Notes stay here for 90 days.</p>
        </>
      )}
    </div>
  );
}

/* ── "Alerts are off on this phone" ── */

function AlertsOffBar() {
  const device = useThisDevice();
  const state = device.data;
  if (!state || (state.support !== "ok" && state.support !== "ios-browser")) return null;
  if (state.here?.enabled) return null;
  return (
    <div className={s.offbar}>
      <BellOffIcon />
      <span><b>Alerts are off on this {deviceWord()}.</b> Everything still lands here. Nothing will buzz.</span>
      <Link href={SETTINGS} className={s.textBtn}>Turn on</Link>
    </div>
  );
}

/* ── Empty ── */

function Empty({ variant }: { variant: Variant }) {
  return (
    <>
      <section className={cn(s.empty, variant === "panel" && s.emptySmall)}>
        <div className={s.emptyIc}><BellIcon /></div>
        <h2>Nothing here yet</h2>
        <p>When something needs you, it lands here.</p>
      </section>
      {variant === "page" ? (
        <>
          <div className={s.sec} style={{ marginTop: 28 }}>What lands here</div>
          <ul className={s.list}>
            <Example icon={<SwordsIcon />} tone={s.icRival} title="Duel challenges and results" text="Someone challenges you, takes your challenge, or a duel ends." />
            <Example icon={<span className={s.ringOpen} />} tone={s.icAmber} title="Your streak at 9 pm" text="Only on days you haven't studied yet." />
            <Example icon={<CardIcon />} title="Premium dates" text="7 days before it ends, 1 day before, and the day it ends." />
            <Example icon={<TickIcon />} tone={s.icRed} title="Replies to your reports" text="When we check or fix a question you reported." />
          </ul>
        </>
      ) : null}
    </>
  );
}

function Example({ icon, tone, title, text }: { icon: ReactNode; tone?: string; title: string; text: string }) {
  return (
    <li className={cn(s.note, s.read)}>
      <span className={cn(s.nIc, tone)}>{icon}</span>
      <div className={s.nT}>
        <span className={s.nHead}><b>{title}</b></span>
        <p>{text}</p>
      </div>
    </li>
  );
}

/* ── Notices: the pinned pile (board 1b) ── */

function NoticePile({ notices, variant, onLeave }: { notices: InboxNotice[]; variant: Variant; onLeave?: () => void }) {
  const [open, setOpen] = useState(false);
  const { close, readNotice } = useInboxActions();
  const more = notices.length - 1;
  const cardProps = { variant, onLeave, onClose: (id: string) => close.mutate(id), onOpen: (n: InboxNotice) => { if (!n.isRead) readNotice.mutate(n.id); } };

  if (more === 0 || !open) {
    const top = notices[0];
    return (
      <>
        <div className={cn(more > 0 ? s.pile : s.firstNotice, more === 1 && s.pileOne)}>
          <NoticeCard notice={top} {...cardProps} />
          {more > 0 ? <span className={cn(s.edge, s.edge1)} aria-hidden="true" /> : null}
          {more > 1 ? <span className={cn(s.edge, s.edge2)} aria-hidden="true" /> : null}
        </div>
        {more > 0 ? (
          <button type="button" className={s.more} onClick={() => setOpen(true)} aria-expanded="false">
            <ChevronDown />
            {more} more notice{more === 1 ? "" : "s"}{notices.every((n) => daysAgo(n.createdAt) < 7) ? " this week" : ""}
            <span className={s.dates}>{dateList(notices.slice(1).map((n) => n.createdAt))}</span>
          </button>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className={s.fan}>
        {notices.map((notice) => <NoticeCard key={notice.id} notice={notice} {...cardProps} />)}
      </div>
      <button type="button" className={s.more} onClick={() => setOpen(false)} aria-expanded="true">
        <ChevronUp />
        Show less
      </button>
    </>
  );
}

function noticeLinkLabel(notice: InboxNotice) {
  if (notice.linkLabel) return notice.linkLabel;
  switch (notice.target?.screen) {
    case "home": return "Open Home";
    case "duel": return "Open Duel";
    case "plan": return "See your plan";
    case "league": return "Open the League";
    case "streak": return "See your streak";
    case "link": return "Open the link";
    default: return "Open";
  }
}

/* A notice's button: a StudyBond page opens in place, an outside link
   (a WhatsApp channel, say) opens in a new tab. */
function NoticeLink({ notice, onClick }: { notice: InboxNotice; onClick: () => void }) {
  if (!notice.url) return null;
  const label = <>{noticeLinkLabel(notice)} <ChevronRight /></>;
  if (isOutsideLink(notice.url)) {
    return (
      <a href={notice.url} className={s.link} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {label}
      </a>
    );
  }
  return <Link href={notice.url as Route} className={s.link} onClick={onClick}>{label}</Link>;
}

function NoticeCard({
  notice, variant, onClose, onOpen, onLeave,
}: {
  notice: InboxNotice;
  variant: Variant;
  onClose: (id: string) => void;
  onOpen: (notice: InboxNotice) => void;
  onLeave?: () => void;
}) {
  const small = variant === "panel";
  return (
    <article className={cn(s.notice, small && s.noticeSmall)} aria-label={`Notice: ${notice.title}`}>
      <span className={s.pin} aria-hidden="true" />
      <div className={s.nk}>
        Notice · {dayMonth(notice.createdAt)}
        {notice.expiresAt ? <span className={s.until}>{untilLabel(notice.expiresAt)}</span> : null}
      </div>
      <h3>{notice.title}</h3>
      {notice.body ? <p>{notice.body}</p> : null}
      <div className={s.nFoot}>
        <div className={s.sign}>The StudyBond team</div>
        <NoticeLink
          notice={notice}
          onClick={() => {
            onOpen(notice);
            if (!isOutsideLink(notice.url)) onLeave?.();
          }}
        />
      </div>
      <button type="button" className={s.nClose} aria-label="Close this notice" onClick={() => onClose(notice.id)}>
        <CloseIcon />
      </button>
    </article>
  );
}

type RowProps = { variant: Variant; now: number; pickedId: string | null; onLeave?: () => void };

function ClosedNoticeRow({ notice, variant, pickedId, onLeave }: RowProps & { notice: InboxNotice }) {
  const { readNotice } = useInboxActions();
  return (
    <li className={cn(s.note, notice.isRead ? s.read : s.unread, pickedId === `a${notice.id}` && s.picked)}>
      <span className={cn(s.nIc, s.icAmber)}><PinIcon /></span>
      <div className={s.nT}>
        <div className={s.nHead}><b>Notice: {notice.title}</b><span className={s.nTime}>{noteTime(notice.createdAt)}</span></div>
        {notice.body && variant === "page" ? <p>{notice.body}</p> : null}
        {notice.url ? (
          <div>
            <NoticeLink
              notice={notice}
              onClick={() => {
                if (!notice.isRead) readNotice.mutate(notice.id);
                if (!isOutsideLink(notice.url)) onLeave?.();
              }}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}

/* ── One note ── */

const CHALLENGE_KINDS = new Set(["DUEL_CHALLENGE_RECEIVED", "DUEL_REMATCH_REQUESTED"]);

function noteIcon(note: InboxNote): [ReactNode, string | undefined] {
  if (note.kind === "STREAK_AT_RISK") return [<span key="r" className={s.ringOpen} />, s.icAmber];
  if (note.category === "STREAKS") return [<span key="r" className={s.ringOpen} />, s.icAmber];
  if (note.kind === "DUEL_CHALLENGE_ACCEPTED") return [<TickIcon key="t" />, s.icRival];
  if (note.kind === "DUEL_SESSION_COMPLETED") return [<SwordsIcon key="s" />, / you won/i.test(note.title) ? s.icAmber : undefined];
  if (note.category === "DUEL") return [<SwordsIcon key="s" />, note.urgent ? s.icRival : undefined];
  if (note.category === "SUBSCRIPTION") return [<CardIcon key="c" />, undefined];
  if (note.category === "REPORTS") return [<TickIcon key="t" />, s.icRed];
  return [<BellIcon key="b" />, undefined];
}

function linkLabel(note: InboxNote): string | null {
  if (!note.url || note.url.startsWith("/dashboard/notifications")) return null;
  switch (note.kind) {
    case "DUEL_SESSION_COMPLETED": return "See the duel";
    case "DUEL_CHALLENGE_ACCEPTED": return note.urgent ? "Open the face-off" : "Open the duel";
    case "DUEL_TASTER_REQUESTED": return note.urgent ? "Send a taster" : "Challenge them";
    case "SUBSCRIPTION_EXPIRY_WARNING":
    case "SUBSCRIPTION_EXPIRED": return "Renew";
    case "SUBSCRIPTION_ACTIVATED":
    case "SUBSCRIPTION_EXTENDED": return "See your plan";
  }
  switch (note.target?.screen) {
    case "home": return "Open Home";
    case "streak": return "See your streak";
    case "plan": return "See your plan";
    case "league": return "Open the League";
    case "duel":
    case "duel-review": return "See the duel";
    default: return "Open";
  }
}

/** "Physics · 20 questions · 15 minutes" without "You have 30 minutes to answer." */
function challengeLine(body: string) {
  return body.replace(/\s*You have \d+ minutes? to answer\.?\s*$/i, "").replace(/\.$/, "");
}

function challengerName(title: string) {
  return title.replace(/\s+(challenged you|wants a rematch)$/i, "");
}

function numberField(payload: unknown, key: string): number | null {
  const value = payload && typeof payload === "object" ? (payload as Record<string, unknown>)[key] : null;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function NoteRow({ note, variant, now, pickedId, onLeave }: RowProps & { note: InboxNote }) {
  const router = useRouter();
  const client = useQueryClient();
  const { readNote } = useInboxActions();
  const [answer, setAnswer] = useState<"idle" | "accepting" | "accepted" | "declining" | "declined">("idle");
  const ref = useRef<HTMLLIElement>(null);
  const picked = pickedId === note.id || pickedId === `n${note.id}`;
  const [icon, tone] = noteIcon(note);
  const panel = variant === "panel";

  // Opened from an alert: bring it into view and count it as read.
  useEffect(() => {
    if (!picked) return;
    ref.current?.scrollIntoView({ block: "center" });
    if (!note.isRead) readNote.mutate(note.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  const read = () => {
    if (!note.isRead) readNote.mutate(note.id);
  };
  const leave = () => {
    read();
    onLeave?.();
  };

  const expiresAt = note.expiresAt ? Date.parse(note.expiresAt) : null;
  const sessionId = numberField(note.payload, "sessionId");
  const isChallenge = CHALLENGE_KINDS.has(note.kind);
  const open = isChallenge && note.urgent && expiresAt !== null && expiresAt > now;

  async function accept() {
    if (!sessionId) {
      leave();
      router.push(note.url as Route);
      return;
    }
    setAnswer("accepting");
    try {
      await acceptDuelChallenge(sessionId);
      setAnswer("accepted");
      read();
      refreshNotifications(client);
      onLeave?.();
      router.push(note.url as Route);
    } catch (error) {
      setAnswer("idle");
      toast.error(error instanceof Error && error.message ? error.message : "Could not accept the challenge.");
      refreshNotifications(client);
    }
  }

  async function decline() {
    if (!sessionId) return;
    setAnswer("declining");
    try {
      await declineDuelChallenge(sessionId);
      setAnswer("declined");
      read();
      refreshNotifications(client);
    } catch (error) {
      setAnswer("idle");
      toast.error(error instanceof Error && error.message ? error.message : "Could not decline the challenge.");
    }
  }

  let body: ReactNode = note.body ? <p>{note.body}</p> : null;
  let extra: ReactNode = null;

  if (isChallenge) {
    body = <p>{challengeLine(note.body)}</p>;
    if (answer === "accepted" || answer === "accepting") {
      extra = <div className={s.done}><TickIcon />Accepted. Opening the face-off.</div>;
    } else if (answer === "declined") {
      extra = <div className={s.nMeta}><span className={cn(s.pill, s.pillDim)}>You declined</span></div>;
    } else if (open) {
      extra = (
        <>
          <div className={s.nMeta}><span className={cn(s.pill, s.pillRival, s.num)}>{leftLabel((expiresAt ?? now) - now)} left to answer</span></div>
          <div className={s.nActs}>
            <button type="button" className={cn(s.btn, s.grow)} onClick={() => void accept()} disabled={answer !== "idle"}>Accept</button>
            {sessionId ? <button type="button" className={s.ghost} onClick={() => void decline()} disabled={answer !== "idle"}>Decline</button> : null}
          </div>
        </>
      );
    } else {
      const from = numberField(note.payload, "fromUserId");
      const name = challengerName(note.title);
      extra = (
        <>
          <div className={s.nMeta}><span className={cn(s.pill, s.pillDim)}>No longer open</span></div>
          {from ? (
            <div>
              <Link href={`/dashboard/duel/new?${new URLSearchParams({ to: String(from), name }).toString()}` as Route} className={s.link} onClick={leave}>
                Challenge {name} back <ChevronRight />
              </Link>
            </div>
          ) : null}
        </>
      );
    }
  } else if (note.kind === "STREAK_AT_RISK" && note.urgent) {
    const ends = expiresAt && expiresAt > now ? expiresAt : lagosMidnight(now);
    extra = (
      <>
        <div className={s.nMeta}><span className={cn(s.pill, s.pillGo, s.num)}>{leftLabel(ends - now)} left</span></div>
        {panel ? (
          <div><Link href={CHALLENGE} className={s.link} onClick={leave}>Start today&apos;s challenge <ChevronRight /></Link></div>
        ) : (
          <div className={s.nActs}><Link href={CHALLENGE} className={cn(s.btn, s.grow)} onClick={leave}>Start today&apos;s challenge</Link></div>
        )}
      </>
    );
  } else if (note.category === "REPORTS") {
    body = panel ? <p>{note.body}</p> : <div className={s.quote}>{note.body}<small>From the StudyBond team</small></div>;
  } else {
    const label = linkLabel(note);
    if (label) {
      extra = <div><Link href={note.url as Route} className={s.link} onClick={leave}>{label} <ChevronRight /></Link></div>;
    }
  }

  return (
    <li ref={ref} className={cn(s.note, note.isRead ? s.read : s.unread, picked && s.picked)}>
      <span className={cn(s.nIc, tone)}>{icon}</span>
      <div className={s.nT}>
        <div className={s.nHead}><b>{note.title}</b><span className={s.nTime}>{noteTime(note.createdAt, now)}</span></div>
        {body}
        {extra}
      </div>
    </li>
  );
}
