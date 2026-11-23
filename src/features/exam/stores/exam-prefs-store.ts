"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getExamPreferences, updateExamPreferences, type ExamPreferences, type TextSize } from "@/lib/api/users";

const TEXT_SIZES: readonly TextSize[] = ["normal", "large", "larger"];
const isTextSize = (v: unknown): v is TextSize => TEXT_SIZES.includes(v as TextSize);

/**
 * The student's exam preferences, set at /dashboard/settings (Exam tab).
 *
 * Saved on the account, so they follow the student to every device. A copy
 * is kept on this device too: it applies at once, works offline, and covers
 * the moment before the account copy arrives. A change is applied here
 * first, then sent. If sending fails, the change waits in `unsynced` and is
 * sent again the next time the account copy is loaded, so it is never
 * silently undone by an older account copy.
 *
 * Auto-advance here is only the default. The exam's ... menu can flip it for
 * one sitting without touching this value. Text size is the same setting
 * everywhere: changing it from the exam menu or the review saves it too.
 */
type ExamPrefsState = ExamPreferences & {
  /** Changes made on this device that the account doesn't have yet. */
  unsynced: Partial<ExamPreferences>;
  setPaperColour: (on: boolean) => void;
  setAutoAdvance: (on: boolean) => void;
  setTextSize: (size: TextSize) => void;
  setWaecGrades: (on: boolean) => void;
  /** Brings this device and the account into line (see useSyncExamPrefs). */
  syncWithAccount: () => Promise<ExamPreferences>;
};

/** Changes sent but not yet answered. While > 0, an account copy can be stale. */
let inFlight = 0;

function deviceStorage() {
  try {
    return window.localStorage;
  } catch {
    // Private windows can block storage; fall back to memory.
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
}

export const useExamPrefs = create<ExamPrefsState>()(
  persist(
    (set, get) => {
      async function send(patch: Partial<ExamPreferences>) {
        inFlight++;
        try {
          await updateExamPreferences(patch);
          // Sent: whatever was waiting for these keys is no longer needed.
          const rest = { ...get().unsynced };
          for (const key of Object.keys(patch) as Array<keyof ExamPreferences>) delete rest[key];
          set({ unsynced: rest });
        } catch {
          set({ unsynced: { ...get().unsynced, ...patch } });
          toast("Saved on this device", {
            description: "We couldn't reach your account. It will be saved there next time.",
          });
        } finally {
          inFlight--;
        }
      }

      return {
        paperColour: true,
        autoAdvance: false,
        textSize: "normal",
        waecGrades: true,
        unsynced: {},
        setPaperColour: (on) => {
          set({ paperColour: on });
          void send({ paperColour: on });
        },
        setAutoAdvance: (on) => {
          set({ autoAdvance: on });
          void send({ autoAdvance: on });
        },
        setWaecGrades: (on) => {
          set({ waecGrades: on });
          void send({ waecGrades: on });
        },
        setTextSize: (size) => {
          if (size === get().textSize) return;
          set({ textSize: size });
          void send({ textSize: size });
        },
        syncWithAccount: async () => {
          const waiting = get().unsynced;
          const prefs = Object.keys(waiting).length
            ? await updateExamPreferences(waiting)
            : await getExamPreferences();
          if (Object.keys(waiting).length) {
            // Clear only what was sent; a newer failed change stays waiting.
            const rest = { ...get().unsynced };
            for (const key of Object.keys(waiting) as Array<keyof ExamPreferences>) {
              if (rest[key] === waiting[key]) delete rest[key];
            }
            set({ unsynced: rest });
          }
          // A change made while this was loading is newer; keep it.
          if (inFlight === 0) {
            set({
              paperColour: prefs.paperColour,
              autoAdvance: prefs.autoAdvance,
              // An older server doesn't send it; keep this device's choice.
              ...(isTextSize(prefs.textSize) ? { textSize: prefs.textSize } : {}),
              ...(typeof prefs.waecGrades === "boolean" ? { waecGrades: prefs.waecGrades } : {}),
            });
          }
          return prefs;
        },
      };
    },
    {
      name: "sb-exam-prefs",
      version: 1,
      storage: createJSONStorage(deviceStorage),
      partialize: (s) => ({
        paperColour: s.paperColour,
        autoAdvance: s.autoAdvance,
        textSize: s.textSize,
        waecGrades: s.waecGrades,
        unsynced: s.unsynced,
      }),
    },
  ),
);

/**
 * Loads the account copy (once, shared across screens by React Query) and
 * brings this device in line. If the account can't be reached (offline, or a
 * backend without the endpoint yet), the device copy simply stays.
 */
export function useSyncExamPrefs() {
  useQuery({
    queryKey: ["users", "exam-preferences"],
    queryFn: () => useExamPrefs.getState().syncWithAccount(),
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
