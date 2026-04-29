"use client";

import type { ExamSessionData, AnswerInput } from "@/lib/api/types";

const DB_NAME = "StudyBond";
const DB_VERSION = 1;
const EXAM_STORE = "examSessionCache";
const SUBMIT_STORE = "submitQueue";

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

// ─── Exported Storage Operations ───

export const offlineStore = {
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
};
