"use client";

import { useQuery } from "@tanstack/react-query";
import { listStudentBoards } from "@/lib/api/institutions";

/**
 * The boards a student may see, open ones first.
 *
 * Kept on the app-wide short cache on purpose: when an admin opens a board or
 * marks one coming soon, signup should show it on the next visit.
 */
export function useStudentBoards() {
  return useQuery({
    queryKey: ["institution", "student-boards"],
    queryFn: listStudentBoards,
  });
}
