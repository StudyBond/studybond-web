"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  closeNotice,
  getAlertSwitches,
  getInbox,
  getUnreadCount,
  markAllRead,
  markNoteRead,
  markNoticeRead,
  notificationKeys,
  updateAlertSwitches,
  type AlertSwitches,
  type InboxPage,
} from "./api";
import { closeReadAlerts, readThisDevice } from "./push";

/* No websocket: the count refreshes every 60 s while the page is visible,
   when the tab comes back, and when the service worker says an alert came. */

function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export function useUnreadCount() {
  const visible = usePageVisible();
  const query = useQuery({
    queryKey: notificationKeys.unread,
    queryFn: getUnreadCount,
    select: (data) => data.unreadCount,
    refetchInterval: visible ? 60_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
    retry: false,
  });
  // Everything read here: take the alerts off this device's screen too.
  useEffect(() => {
    if (query.data === 0) void closeReadAlerts("none");
  }, [query.data]);
  return query;
}

type InboxData = InfiniteData<InboxPage, string | null>;

export function useInbox() {
  const query = useInfiniteQuery({
    queryKey: notificationKeys.inbox,
    queryFn: ({ pageParam }) => getInbox(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextBefore,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });

  // Alerts still on screen for notes that are now read: close them.
  const pages = query.data?.pages;
  useEffect(() => {
    if (!pages) return;
    const unread: string[] = [];
    for (const page of pages) {
      for (const notice of page.notices) if (!notice.isRead) unread.push(`a${notice.id}`);
      for (const item of page.items) if (!item.isRead) unread.push(item.type === "note" ? `n${item.id}` : `a${item.id}`);
    }
    void closeReadAlerts(unread);
  }, [pages]);

  return query;
}

/* ── Read, close, mark all ── */

function setUnread(client: QueryClient, unreadCount: number) {
  client.setQueryData(notificationKeys.unread, { unreadCount });
}

function patchInbox(client: QueryClient, change: (page: InboxPage) => InboxPage) {
  client.setQueryData<InboxData>(notificationKeys.inbox, (old) =>
    old ? { ...old, pages: old.pages.map(change) } : old,
  );
}

export function useInboxActions() {
  const client = useQueryClient();
  const now = () => new Date().toISOString();

  const readNote = useMutation({
    mutationFn: (id: string) => markNoteRead(id),
    onMutate: (id) =>
      patchInbox(client, (page) => ({
        ...page,
        items: page.items.map((item) => (item.type === "note" && item.id === id && !item.isRead ? { ...item, isRead: true, readAt: now() } : item)),
      })),
    onSuccess: (data) => setUnread(client, data.unreadCount),
  });

  const readNotice = useMutation({
    mutationFn: (id: string) => markNoticeRead(id),
    onMutate: (id) =>
      patchInbox(client, (page) => ({
        ...page,
        notices: page.notices.map((notice) => (notice.id === id ? { ...notice, isRead: true } : notice)),
        items: page.items.map((item) => (item.type === "notice" && item.id === id ? { ...item, isRead: true } : item)),
      })),
    onSuccess: (data) => setUnread(client, data.unreadCount),
  });

  const close = useMutation({
    mutationFn: (id: string) => closeNotice(id),
    onMutate: (id) =>
      patchInbox(client, (page) => ({
        ...page,
        notices: page.notices.filter((notice) => notice.id !== id),
      })),
    onSuccess: (data) => setUnread(client, data.unreadCount),
    // The closed notice moves down into its day: fetch the list again.
    onSettled: () => void client.invalidateQueries({ queryKey: notificationKeys.inbox }),
  });

  const readAll = useMutation({
    mutationFn: markAllRead,
    onMutate: () =>
      patchInbox(client, (page) => ({
        ...page,
        notices: page.notices.map((notice) => ({ ...notice, isRead: true })),
        items: page.items.map((item) => ({ ...item, isRead: true })),
      })),
    onSuccess: (data) => setUnread(client, data.unreadCount),
    onError: () => void client.invalidateQueries({ queryKey: notificationKeys.all }),
  });

  return { readNote, readNotice, close, readAll };
}

/** After an alert arrives or something changes elsewhere. */
export function refreshNotifications(client: QueryClient) {
  void client.invalidateQueries({ queryKey: notificationKeys.unread });
  void client.invalidateQueries({ queryKey: notificationKeys.inbox });
}

/* ── This device and the switches ── */

export function useThisDevice(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.device,
    queryFn: readThisDevice,
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useAlertSwitches() {
  return useQuery({ queryKey: notificationKeys.switches, queryFn: getAlertSwitches, staleTime: 5 * 60_000 });
}

export function useSetAlertSwitch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AlertSwitches>) => updateAlertSwitches(patch),
    onMutate: (patch) => {
      const before = client.getQueryData<AlertSwitches>(notificationKeys.switches);
      if (before) client.setQueryData(notificationKeys.switches, { ...before, ...patch });
      return { before };
    },
    onError: (_error, _patch, context) => {
      if (context?.before) client.setQueryData(notificationKeys.switches, context.before);
    },
    onSuccess: (data) => client.setQueryData(notificationKeys.switches, data),
  });
}
