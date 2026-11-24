import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

/* The notifications API (backend 0ea22a2). One note per event, the pinned
   pile of notices, alert switches and the devices that get alerts. */

export type NoteTarget = { screen: string; [key: string]: unknown } | null;

export type InboxNote = {
  type: "note";
  id: string;
  kind: string;
  category: string;
  title: string;
  body: string;
  target: NoteTarget;
  /** The web page for this note. */
  url: string;
  payload: unknown;
  createdAt: string;
  readAt: string | null;
  expiresAt: string | null;
  isRead: boolean;
  /** Still running out: goes under "Needs you now". */
  urgent: boolean;
};

export type InboxNotice = {
  type: "notice";
  id: string;
  title: string;
  body: string;
  target: NoteTarget;
  url: string | null;
  createdAt: string;
  expiresAt: string | null;
  isRead: boolean;
  closedAt: string | null;
};

export type InboxItem = InboxNote | InboxNotice;

export type InboxPage = {
  /** The pinned pile, newest first. First page only. */
  notices: InboxNotice[];
  /** Notes and closed notices, newest first. */
  items: InboxItem[];
  nextBefore: string | null;
  unreadCount: number;
};

export type AlertSwitches = {
  streaks: boolean;
  achievements: boolean;
  duel: boolean;
  subscription: boolean;
  reports: boolean;
  announcements: boolean;
};

export type AlertDevice = {
  id: string;
  channel: "WEB" | "APP";
  platform: string;
  label: string;
  enabled: boolean;
  lastOpenedAt: string;
  createdAt: string;
  isThisDevice: boolean;
};

export type PushPlatform = "android" | "ios" | "windows" | "macos" | "linux" | "other";

export const notificationKeys = {
  all: ["notifications"] as const,
  inbox: ["notifications", "inbox"] as const,
  unread: ["notifications", "unread"] as const,
  switches: ["notifications", "switches"] as const,
  device: ["notifications", "this-device"] as const,
};

const BASE = "/api/notifications";

async function data<T>(path: string, init?: RequestInit) {
  return (await apiClient<SuccessEnvelope<T>>(`${BASE}${path}`, init)).data;
}

export function getInbox(before?: string | null, limit = 20) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (before) query.set("before", before);
  return data<InboxPage>(`/inbox?${query.toString()}`);
}

export function getUnreadCount() {
  return data<{ unreadCount: number }>("/unread-count");
}

export function markNoteRead(id: string) {
  return data<{ unreadCount: number }>(`/notes/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export function markNoticeRead(id: string) {
  return data<{ unreadCount: number }>(`/notices/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export function closeNotice(id: string) {
  return data<{ unreadCount: number }>(`/notices/${encodeURIComponent(id)}/close`, { method: "PATCH" });
}

export function markAllRead() {
  return data<{ unreadCount: number }>("/read-all", { method: "PATCH" });
}

export async function getAlertSwitches() {
  return (await data<{ preferences: AlertSwitches }>("/preferences")).preferences;
}

export async function updateAlertSwitches(patch: Partial<AlertSwitches>) {
  return (
    await data<{ preferences: AlertSwitches }>("/preferences", {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
  ).preferences;
}

export function getPushConfig() {
  return data<{ webPushPublicKey: string | null }>("/push-config");
}

export async function listAlertDevices(endpoint?: string | null) {
  const query = endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : "";
  return (await data<{ devices: AlertDevice[] }>(`/devices${query}`)).devices;
}

export async function registerWebDevice(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  platform: PushPlatform;
  label: string;
}) {
  return (
    await data<{ device: AlertDevice }>("/devices", {
      method: "POST",
      body: JSON.stringify({ channel: "WEB", ...input }),
    })
  ).device;
}

export function stopThisDevice(endpoint: string) {
  return data<{ stopped: boolean }>("/devices/stop-this", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
}

export async function setDeviceEnabled(id: string, enabled: boolean) {
  return (
    await data<{ device: AlertDevice }>(`/devices/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    })
  ).device;
}

export function stopDevice(id: string) {
  return data<{ stopped: boolean }>(`/devices/${encodeURIComponent(id)}`, { method: "DELETE" });
}
