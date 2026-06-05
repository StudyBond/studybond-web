"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { useOfflineSync } from "@/features/exam/hooks/use-offline-sync";

// ─── Online/Offline state via useSyncExternalStore (no flicker, SSR-safe) ───

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  // During SSR, assume online
  return true;
}

// ─── Context ───

type OfflineSyncContextValue = {
  isOnline: boolean;
  drainQueue: () => Promise<void>;
};

const OfflineSyncContext = createContext<OfflineSyncContextValue>({
  isOnline: true,
  drainQueue: async () => {},
});

export function useOfflineStatus() {
  return useContext(OfflineSyncContext);
}

// ─── Provider ───

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot);
  const { drainQueue } = useOfflineSync();

  return (
    <OfflineSyncContext.Provider value={{ isOnline, drainQueue }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}
