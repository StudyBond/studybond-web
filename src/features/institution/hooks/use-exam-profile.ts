"use client";

import { useQuery } from "@tanstack/react-query";
import { getExamProfile } from "@/lib/api/institutions";

/**
 * The signed-in student's institution: its subjects and its exam rules.
 *
 * This replaces the subject lists that were written by hand into five separate
 * screens, along with the rules that went with them ("four subjects is a full
 * exam", "English is compulsory").
 *
 * An institution's configuration changes perhaps twice a year, so this is held
 * far longer than the app-wide 30 second default. Every screen that needs
 * subjects shares one cached copy.
 */
export function useExamProfile(institutionCode?: string) {
  return useQuery({
    queryKey: ["institution", "exam-profile", institutionCode ?? "self"],
    queryFn: () => getExamProfile(institutionCode),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
