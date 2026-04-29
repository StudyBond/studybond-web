import { apiClient } from "@/lib/api/client";
import type {
  BookmarksList,
  Bookmark,
  BookmarksSummary,
  BookmarkDeleteResult,
  CreateBookmarkPayload,
  UpdateBookmarkPayload,
  SuccessEnvelope,
} from "@/lib/api/types";

/** Quick summary (used by dashboard widget — fetches 1 item just for limits). */
export async function getBookmarksSummary() {
  const response = await apiClient<SuccessEnvelope<BookmarksSummary>>(
    "/api/bookmarks?limit=1",
  );
  return response.data;
}

/** Paginated bookmark list with optional subject filter. */
export async function getBookmarks(params?: {
  page?: number;
  limit?: number;
  subject?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.subject) searchParams.set("subject", params.subject);

  const query = searchParams.toString();
  const response = await apiClient<SuccessEnvelope<BookmarksList>>(
    `/api/bookmarks${query ? `?${query}` : ""}`,
  );
  return response.data;
}

/** Create a new bookmark. */
export async function createBookmark(payload: CreateBookmarkPayload) {
  const response = await apiClient<SuccessEnvelope<Bookmark>>(
    "/api/bookmarks",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Update bookmark notes. */
export async function updateBookmarkNotes(
  bookmarkId: number,
  payload: UpdateBookmarkPayload,
) {
  const response = await apiClient<SuccessEnvelope<Bookmark>>(
    `/api/bookmarks/${bookmarkId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Delete a bookmark. */
export async function deleteBookmark(bookmarkId: number) {
  const response = await apiClient<SuccessEnvelope<BookmarkDeleteResult>>(
    `/api/bookmarks/${bookmarkId}`,
    {
      method: "DELETE",
    },
  );
  return response.data;
}

/** Get a single bookmark by ID (includes full question data). */
export async function getBookmarkById(bookmarkId: number) {
  const response = await apiClient<SuccessEnvelope<Bookmark>>(
    `/api/bookmarks/${bookmarkId}`,
  );
  return response.data;
}
