"use client";

import type { ExamSessionData, ExamResult, AnswerInput } from "@/lib/api/types";

const DB_NAME = "StudyBond";
const DB_VERSION = 2;
const EXAM_STORE = "examSessionCache";
const SUBMIT_STORE = "submitQueue";
const ANSWER_STORE = "answerProgress";
const RESULT_STORE = "examResultCache";

let dbPromise: Promise<IDBDatabase> | null = null;

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getFallbackKey(storeName: string, key: string) {
  return `${DB_NAME}:${storeName}:${key}`;
}

function saveToFallback(storeName: string, key: string, value: string) {
  const storage = getLocalStorage();
  storage?.setItem(getFallbackKey(storeName, key), value);
}

function readFromFallback(storeName: string, key: string) {
  const storage = getLocalStorage();
  return storage?.getItem(getFallbackKey(storeName, key)) ?? null;
}

function removeFromFallback(storeName: string, key: string) {
  const storage = getLocalStorage();
  storage?.removeItem(getFallbackKey(storeName, key));
}

function openDatabase() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is unavailable."));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(EXAM_STORE)) {
          db.createObjectStore(EXAM_STORE);
        }

        if (!db.objectStoreNames.contains(SUBMIT_STORE)) {
          db.createObjectStore(SUBMIT_STORE);
        }

        // v2: answer progress persistence for crash recovery
        if (!db.objectStoreNames.contains(ANSWER_STORE)) {
          db.createObjectStore(ANSWER_STORE);
        }

        // v2: exam result cache for offline review
        if (!db.objectStoreNames.contains(RESULT_STORE)) {
          db.createObjectStore(RESULT_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Failed to open offline database."));
    });
  }

  return dbPromise;
}

async function writeString(storeName: string, key: string, value: string) {
  try {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const request = transaction.objectStore(storeName).put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Failed to write offline data."));
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to write offline data."));
    });
  } catch {
    saveToFallback(storeName, key, value);
  }
}

async function readString(storeName: string, key: string) {
  try {
    const db = await openDatabase();

    return await new Promise<string | null>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).get(key);

      request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
      request.onerror = () => reject(request.error ?? new Error("Failed to read offline data."));
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to read offline data."));
    });
  } catch {
    return readFromFallback(storeName, key);
  }
}

async function removeString(storeName: string, key: string) {
  try {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const request = transaction.objectStore(storeName).delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Failed to remove offline data."));
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to remove offline data."));
    });
  } catch {
    removeFromFallback(storeName, key);
  }
}

/**
 * Retrieve all keys in an object store that match an optional prefix.
 * Used to enumerate all queued submissions without knowing exam IDs upfront.
 */
async function getAllKeys(storeName: string, prefix?: string): Promise<string[]> {
  try {
    const db = await openDatabase();

    return await new Promise<string[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAllKeys();

      request.onsuccess = () => {
        const keys = (request.result as IDBValidKey[])
          .filter((k): k is string => typeof k === "string")
          .filter((k) => !prefix || k.startsWith(prefix));
        resolve(keys);
      };
      request.onerror = () => reject(request.error ?? new Error("Failed to list offline keys."));
    });
  } catch {
    // Fallback: scan localStorage keys
    const storage = getLocalStorage();
    if (!storage) return [];
    const result: string[] = [];
    const fallbackPrefix = `${DB_NAME}:${storeName}:${prefix ?? ""}`;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(fallbackPrefix)) {
        // Strip the DB_NAME:storeName: prefix to return the bare key
        result.push(key.slice(`${DB_NAME}:${storeName}:`.length));
      }
    }
    return result;
  }
}

/**
 * ─── Basic Obfuscation (Security via Obscurity) ───
 * This prevents casual inspection of IDB from revealing raw questions.
 * It is NOT military-grade encryption, but sufficient for this context.
 */
function obfuscate(data: unknown): string {
  const json = JSON.stringify(data);
  // Simple Base64 + shifting
  return btoa(encodeURIComponent(json)).split("").reverse().join("");
}

function deobfuscate<T>(str: string): T | null {
  try {
    const json = decodeURIComponent(atob(str.split("").reverse().join("")));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// ─── Answer Progress Types ───

export type PersistedQuestionState = {
  answer: string | null;
  flagged: boolean;
  timeSpentSeconds: number;
};

export type PersistedAnswerProgress = {
  examId: number;
  /** Map serialized as Record<questionId, state> */
  states: Record<number, PersistedQuestionState>;
  /** Timestamp when this was last persisted */
  savedAt: number;
};

// ─── Exported Storage Operations ───

export const offlineStore = {
  // ─── Exam Session Cache ───

  /** Save an active exam session payload to IndexedDB securely. */
  async saveExamSession(examId: number, sessionData: ExamSessionData) {
    await writeString(EXAM_STORE, `exam_${examId}`, obfuscate(sessionData));
  },

  /** Retrieve and de-obfuscate an active exam session. */
  async getExamSession(examId: number): Promise<ExamSessionData | null> {
    const obf = await readString(EXAM_STORE, `exam_${examId}`);
    if (!obf) return null;
    return deobfuscate<ExamSessionData>(obf);
  },

  /** Clear a saved session once it has been successfully submitted. */
  async clearExamSession(examId: number) {
    await removeString(EXAM_STORE, `exam_${examId}`);
  },

  // ─── Submit Queue ───

  /** Queue a submission payload if the network is down. */
  async queueSubmit(examId: number, answers: AnswerInput[]) {
    await writeString(SUBMIT_STORE, `submit_${examId}`, obfuscate(answers));
  },

  /** Retrieve a queued submission payload. */
  async getQueuedSubmit(examId: number): Promise<AnswerInput[] | null> {
    const obf = await readString(SUBMIT_STORE, `submit_${examId}`);
    if (!obf) return null;
    return deobfuscate<AnswerInput[]>(obf);
  },

  /** Remove a queued submission payload after successful backend sync. */
  async clearQueuedSubmit(examId: number) {
    await removeString(SUBMIT_STORE, `submit_${examId}`);
  },

  /**
   * Get all exam IDs that have queued submissions waiting to sync.
   * Returns numeric exam IDs extracted from the `submit_{examId}` keys.
   */
  async getAllQueuedSubmitIds(): Promise<number[]> {
    const keys = await getAllKeys(SUBMIT_STORE, "submit_");
    return keys
      .map((k) => {
        const id = Number.parseInt(k.replace("submit_", ""), 10);
        return Number.isFinite(id) ? id : null;
      })
      .filter((id): id is number => id !== null);
  },

  // ─── Answer Progress Persistence (crash recovery) ───

  /** Persist in-progress answers to IDB so they survive tab crashes. */
  async saveAnswerProgress(examId: number, states: Record<number, PersistedQuestionState>) {
    const payload: PersistedAnswerProgress = {
      examId,
      states,
      savedAt: Date.now(),
    };
    await writeString(ANSWER_STORE, `progress_${examId}`, obfuscate(payload));
  },

  /** Retrieve persisted answer progress for crash recovery. */
  async getAnswerProgress(examId: number): Promise<PersistedAnswerProgress | null> {
    const obf = await readString(ANSWER_STORE, `progress_${examId}`);
    if (!obf) return null;
    return deobfuscate<PersistedAnswerProgress>(obf);
  },

  /** Clear answer progress after exam is submitted or abandoned. */
  async clearAnswerProgress(examId: number) {
    await removeString(ANSWER_STORE, `progress_${examId}`);
  },

  // ─── Exam Result Cache (offline review) ───

  /** Cache a completed exam result for offline review. */
  async saveExamResult(examId: number, result: ExamResult) {
    await writeString(RESULT_STORE, `result_${examId}`, obfuscate(result));
  },

  /** Retrieve a cached exam result for offline review. */
  async getExamResult(examId: number): Promise<ExamResult | null> {
    const obf = await readString(RESULT_STORE, `result_${examId}`);
    if (!obf) return null;
    return deobfuscate<ExamResult>(obf);
  },

  /** Clear a cached exam result. */
  async clearExamResult(examId: number) {
    await removeString(RESULT_STORE, `result_${examId}`);
  },
};
