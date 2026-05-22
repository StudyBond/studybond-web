"use client";

import {
  dismissAnnouncement,
  dismissNotification,
  getNotificationActivity,
  getNotificationAnnouncements,
  getNotificationPreferences,
  getNotificationsSummary,
  markAllNotificationsRead,
  markAnnouncementRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "@/lib/api/notifications";
import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function useNotificationsSummary(recentLimit = 6) {
  return useQuery({
    queryKey: ["notifications", "summary", recentLimit],
    queryFn: () => getNotificationsSummary(recentLimit),
    enabled: notificationsUiEnabled,
    staleTime: 20_000,
  });
}

export function useNotificationActivity(params?: {
  page?: number;
  limit?: number;
  state?: "all" | "unread";
  category?: "STREAKS" | "ACHIEVEMENTS" | "COLLABORATION" | "SUBSCRIPTION" | "REPORTS";
}) {
  return useQuery({
    queryKey: ["notifications", "activity", params ?? {}],
    queryFn: () => getNotificationActivity(params),
    enabled: notificationsUiEnabled,
  });
}

export function useNotificationAnnouncements(params?: {
  page?: number;
  limit?: number;
  state?: "all" | "unread";
}) {
  return useQuery({
    queryKey: ["notifications", "announcements", params ?? {}],
    queryFn: () => getNotificationAnnouncements(params),
    enabled: notificationsUiEnabled,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: getNotificationPreferences,
    enabled: notificationsUiEnabled,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAnnouncementRead,
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useDismissAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissAnnouncement,
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useNotificationsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!notificationsUiEnabled || typeof window === "undefined") {
      return;
    }

    let socket: WebSocket | null = null;
    let cancelled = false;
    let reconnectTimer: number | null = null;

    async function connect() {
      try {
        const response = await fetch("/api/auth/ws-token", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          success: boolean;
          token?: string;
          backendWsUrl?: string;
        };

        if (!payload.success || !payload.token || !payload.backendWsUrl || cancelled) {
          return;
        }

        socket = new WebSocket(
          `${payload.backendWsUrl}/api/notifications/ws?token=${encodeURIComponent(payload.token)}`
        );

        socket.onmessage = (event) => {
          const parsed = JSON.parse(event.data) as {
            type?: string;
            payload?: { title?: string; body?: string };
          };

          if (parsed.type === "notification.activity.created" && parsed.payload?.title) {
            toast(parsed.payload.title, {
              description: parsed.payload.body,
            });
          }

          if (
            parsed.type === "notification.summary" ||
            parsed.type === "notification.activity.created" ||
            parsed.type === "notification.activity.updated"
          ) {
            invalidateNotifications(queryClient);
          }
        };

        socket.onclose = () => {
          if (cancelled) return;
          reconnectTimer = window.setTimeout(connect, 3000);
        };
      } catch {
        reconnectTimer = window.setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [queryClient]);
}
