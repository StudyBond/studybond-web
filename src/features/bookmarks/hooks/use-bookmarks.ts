import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookmarks,
  createBookmark,
  updateBookmarkNotes,
  deleteBookmark,
  getBookmarkById,
} from "@/lib/api/bookmarks";
import type { CreateBookmarkPayload } from "@/lib/api/types";

type UseBookmarksParams = {
  page?: number;
  limit?: number;
  subject?: string;
};

export function useBookmarks(params?: UseBookmarksParams) {
  return useQuery({
    queryKey: ["bookmarks", params?.page, params?.limit, params?.subject],
    queryFn: () => getBookmarks(params),
  });
}

export function useBookmarkById(bookmarkId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["bookmark", bookmarkId],
    queryFn: () => getBookmarkById(bookmarkId),
    enabled: !!bookmarkId && enabled,
  });
}

export function useCreateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookmarkPayload) => createBookmark(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      qc.invalidateQueries({ queryKey: ["bookmarks-summary"] });
    },
  });
}

export function useUpdateBookmarkNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookmarkId,
      notes,
    }: {
      bookmarkId: number;
      notes: string | null;
    }) => updateBookmarkNotes(bookmarkId, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookmarkId: number) => deleteBookmark(bookmarkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      qc.invalidateQueries({ queryKey: ["bookmarks-summary"] });
    },
  });
}
