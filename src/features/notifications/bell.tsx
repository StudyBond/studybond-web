"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/cn";

import { useInboxActions, useUnreadCount } from "./hooks";
import { BellIcon, CloseIcon } from "./icons";
import { Inbox } from "./inbox";
import s from "./notifications.module.css";

/* The bell. On a phone it opens the Notifications page; on a laptop it
   opens a panel beside the sidebar (board 5). */

function countLabel(count: number) {
  return count > 9 ? "9+" : String(count);
}

export function NotificationBell({ mobile = false }: { mobile?: boolean }) {
  const unread = useUnreadCount();
  const count = unread.data ?? 0;
  const label = count > 0 ? `Notifications, ${count} new` : "Notifications";

  if (mobile) {
    return (
      <Link href={"/dashboard/notifications" as Route} className={s.bell} aria-label={label}>
        <BellIcon />
        {count > 0 ? <span className={cn(s.badge, s.num)}>{countLabel(count)}</span> : null}
      </Link>
    );
  }
  return <SideBell count={count} label={label} />;
}

function SideBell({ count, label }: { count: number; label: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const bell = useRef<HTMLButtonElement>(null);
  const onPage = pathname === "/dashboard/notifications";

  // A new page closes the panel.
  const [shownOn, setShownOn] = useState(pathname);
  if (shownOn !== pathname) {
    setShownOn(pathname);
    if (open) setOpen(false);
  }

  const close = useCallback(() => {
    setOpen(false);
    bell.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={bell}
        type="button"
        className={cn(s.bell, (open || onPage) && s.bellOn)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (onPage ? undefined : setOpen((value) => !value))}
      >
        <BellIcon />
        {count > 0 ? <span className={cn(s.badge, s.badgeSide, s.num)}>{countLabel(count)}</span> : null}
      </button>
      {open ? createPortal(<Panel onClose={close} />, document.body) : null}
    </>
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const unread = useUnreadCount();
  const { readAll } = useInboxActions();
  const allRead = (unread.data ?? 0) === 0;

  useEffect(() => {
    heading.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sb-ui">
      <button type="button" className={s.veil} aria-label="Close notifications" tabIndex={-1} onClick={onClose} />
      <section className={s.drawer} role="dialog" aria-modal="false" aria-labelledby="sb-notif-panel-title">
        <div className={s.dHead}>
          <h2 id="sb-notif-panel-title" ref={heading} tabIndex={-1}>Notifications</h2>
          <button type="button" className={s.textBtn} onClick={() => readAll.mutate()} disabled={allRead}>
            {allRead ? "All read" : "Mark all read"}
          </button>
          <button type="button" className={s.iconBtn} aria-label="Close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className={s.dBody}>
          <Inbox variant="panel" onLeave={onClose} />
        </div>
        <div className={s.dFoot}>
          <Link href={"/dashboard/notifications" as Route} className={s.link} onClick={onClose}>See all notifications</Link>
          <Link href={"/dashboard/settings?tab=notifications" as Route} className={cn(s.link, s.linkDim)} onClick={onClose}>Alert settings</Link>
        </div>
      </section>
    </div>
  );
}
