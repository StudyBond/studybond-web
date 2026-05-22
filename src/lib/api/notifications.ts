import { apiClient } from "@/lib/api/client";
import type {
  NotificationActivityMutation,
  NotificationAnnouncementMutation,
  NotificationPreferencesResponse,
  NotificationsActivityList,
  NotificationsAnnouncementsList,
  NotificationsReadAllResponse,
  NotificationsSummary,
  SuccessEnvelope,
} from "@/lib/api/types";

function buildSearch(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getNotificationsSummary(recentLimit?: number) {
  const response = await apiClient<SuccessEnvelope<NotificationsSummary>>(
    `/api/notifications/summary${buildSearch({ recentLimit })}`
  );
  return response.data;
}

export async function getNotificationActivity(params?: {
  page?: number;
  limit?: number;
  state?: "all" | "unread";
  category?: "STREAKS" | "ACHIEVEMENTS" | "COLLABORATION" | "SUBSCRIPTION" | "REPORTS";
}) {
  const response = await apiClient<SuccessEnvelope<NotificationsActivityList>>(
    `/api/notifications/activity${buildSearch({
      page: params?.page,
      limit: params?.limit,
      state: params?.state,
      category: params?.category,
    })}`
  );
  return response.data;
}

export async function getNotificationAnnouncements(params?: {
  page?: number;
  limit?: number;
  state?: "all" | "unread";
}) {
  const response = await apiClient<SuccessEnvelope<NotificationsAnnouncementsList>>(
    `/api/notifications/announcements${buildSearch({
      page: params?.page,
      limit: params?.limit,
      state: params?.state,
    })}`
  );
  return response.data;
}

export async function getNotificationPreferences() {
  const response = await apiClient<SuccessEnvelope<NotificationPreferencesResponse>>(
    "/api/notifications/preferences"
  );
  return response.data;
}

export async function updateNotificationPreferences(
  payload: Partial<NotificationPreferencesResponse["preferences"]>
) {
  const response = await apiClient<SuccessEnvelope<NotificationPreferencesResponse>>(
    "/api/notifications/preferences",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await apiClient<SuccessEnvelope<NotificationActivityMutation>>(
    `/api/notifications/activity/${notificationId}/read`,
    { method: "PATCH" }
  );
  return response.data;
}

export async function dismissNotification(notificationId: string) {
  const response = await apiClient<SuccessEnvelope<NotificationActivityMutation>>(
    `/api/notifications/activity/${notificationId}/dismiss`,
    { method: "PATCH" }
  );
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient<SuccessEnvelope<NotificationsReadAllResponse>>(
    "/api/notifications/activity/read-all",
    { method: "PATCH" }
  );
  return response.data;
}

export async function markAnnouncementRead(announcementId: string) {
  const response = await apiClient<SuccessEnvelope<NotificationAnnouncementMutation>>(
    `/api/notifications/announcements/${announcementId}/read`,
    { method: "PATCH" }
  );
  return response.data;
}

export async function dismissAnnouncement(announcementId: string) {
  const response = await apiClient<SuccessEnvelope<NotificationAnnouncementMutation>>(
    `/api/notifications/announcements/${announcementId}/dismiss`,
    { method: "PATCH" }
  );
  return response.data;
}
