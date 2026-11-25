"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { markNoteRead, markNoticeRead } from "./api";
import { isOutsideLink } from "./format";
import { refreshNotifications, useThisDevice } from "./hooks";
import { CloseIcon } from "./icons";
import { refreshThisDevice, registerAlertWorker, type PushNote, type WorkerMessage } from "./push";
import s from "./notifications.module.css";

/* Links the page and the service worker (no websocket):
   - an alert that arrives while StudyBond is open on screen shows here as a
     banner and refreshes the inbox, instead of a system alert;
   - tapping an alert on this device opens its page in this tab;
   - a browser that already gets alerts tells the backend it was opened. */

const PAPER = /^\/exams\/\d+\/?$/;

function isMessage(data: unknown): data is WorkerMessage {
  return Boolean(data && typeof data === "object" && (data as { source?: unknown }).source === "sb-alerts");
}

export function AlertsBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const client = useQueryClient();
  const [banner, setBanner] = useState<PushNote | null>(null);
  const onDashboard = pathname.startsWith("/dashboard");
  const where = useRef(pathname);
  useEffect(() => {
    where.current = pathname;
  }, [pathname]);

  // The worker only handles push and clicks, so registering it is cheap.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    registerAlertWorker().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if (!isMessage(event.data)) return;
      const message = event.data;
      if (message.type === "open") {
        router.push(message.url as Route);
        return;
      }
      refreshNotifications(client);
      // Never interrupt a paper; the note waits in the inbox.
      if (message.type === "note" && !PAPER.test(where.current)) setBanner(message.note);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [client, router]);

  // "Last opened" for this browser, once per page load.
  const device = useThisDevice(onDashboard);
  const refreshed = useRef(false);
  useEffect(() => {
    if (refreshed.current || !device.data) return;
    refreshed.current = true;
    void refreshThisDevice(device.data);
  }, [device.data]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) return null;

  const open = () => {
    const id = banner.id.slice(1);
    if (/^\d+$/.test(id)) {
      const read = banner.id.startsWith("a") ? markNoticeRead(id) : markNoteRead(id);
      void read.then(() => refreshNotifications(client)).catch(() => undefined);
    }
    setBanner(null);
    if (isOutsideLink(banner.url)) window.open(banner.url, "_blank", "noopener,noreferrer");
    else router.push((banner.url || "/dashboard/notifications") as Route);
  };

  return (
    <div className={cn("sb-ui", s.banner)} role="status" aria-live="polite">
      <span className={s.bannerT}>
        <b>{banner.title}</b>
        {banner.body ? <small>{banner.body}</small> : null}
      </span>
      <button type="button" className={s.btn} onClick={open}>See it</button>
      <button type="button" className={s.iconBtn} aria-label="Hide" onClick={() => setBanner(null)}><CloseIcon /></button>
    </div>
  );
}
