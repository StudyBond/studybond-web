"use client";

import { useCallback, useState, useEffect } from "react";

// ─── Configuration ───

/** Number of screenshot violations before initial lockout */
const INITIAL_VIOLATIONS_BEFORE_LOCKOUT = 3;
/** Cooldown in minutes before unlock becomes available */
const COOLDOWN_MINUTES = 5;
/** Violations allowed after a cooldown before locking again */
const POST_COOLDOWN_VIOLATIONS = 1;
/** Max number of cooldowns the user can use */
const MAX_COOLDOWNS = 3;

// ─── Types ───

export type ReviewLockState = {
  /** Whether the review is currently locked */
  locked: boolean;
  /** Timestamp (ms) when lockout was first triggered */
  lockedAt: number | null;
  /** Number of cooldowns used (max 3) */
  cooldownsUsed: number;
  /** Violations recorded in the current phase */
  phaseViolations: number;
  /** Whether the exam is permanently locked (no more chances) */
  permanentLock: boolean;
};

const DEFAULT_STATE: ReviewLockState = {
  locked: false,
  lockedAt: null,
  cooldownsUsed: 0,
  phaseViolations: 0,
  permanentLock: false,
};

// ─── localStorage helpers ───

function getStorageKey(examId: number) {
  return `sb-review-lock-${examId}`;
}

function loadLockState(examId: number): ReviewLockState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(getStorageKey(examId));
    if (!raw) return DEFAULT_STATE;
    // Migration: if old state format, reset to default
    const parsed = JSON.parse(raw);
    if ('violations' in parsed && !('phaseViolations' in parsed)) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveLockState(examId: number, state: ReviewLockState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(examId), JSON.stringify(state));
  } catch {
    // Storage full or blocked — fail silently
  }
}

// ─── Hook ───

export function useReviewLockout(examId: number) {
  const [lockState, setLockState] = useState<ReviewLockState>(() =>
    loadLockState(examId),
  );

  // Sync state → localStorage on every change
  useEffect(() => {
    saveLockState(examId, lockState);
  }, [examId, lockState]);

  /** Whether the "Unlock" button should be available */
  const canRequestLastChance = useCallback(() => {
    if (lockState.permanentLock) return false;
    if (!lockState.locked || !lockState.lockedAt) return false;
    if (lockState.cooldownsUsed >= MAX_COOLDOWNS) return false;

    const elapsed = Date.now() - lockState.lockedAt;
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
    return elapsed >= cooldownMs;
  }, [lockState]);

  /** Minutes remaining before unlock is available */
  const lastChanceCooldownRemaining = useCallback(() => {
    if (!lockState.locked || !lockState.lockedAt) return 0;
    if (lockState.permanentLock || lockState.cooldownsUsed >= MAX_COOLDOWNS) return 0;

    const elapsed = Date.now() - lockState.lockedAt;
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
    const remaining = Math.max(0, cooldownMs - elapsed);
    return Math.ceil(remaining / 60000);
  }, [lockState]);

  /** Record a screenshot violation. Returns true if exam is now locked. */
  const recordViolation = useCallback((): boolean => {
    let shouldLock = false;

    setLockState((prev) => {
      // If already permanently locked, do nothing
      if (prev.permanentLock) {
        shouldLock = true;
        return prev;
      }

      const allowedViolations = prev.cooldownsUsed === 0 
        ? INITIAL_VIOLATIONS_BEFORE_LOCKOUT 
        : POST_COOLDOWN_VIOLATIONS;

      const newViolations = prev.phaseViolations + 1;

      if (newViolations >= allowedViolations) {
        shouldLock = true;
        // If they already used their max cooldowns, this lock is permanent
        if (prev.cooldownsUsed >= MAX_COOLDOWNS) {
          return {
            ...prev,
            phaseViolations: newViolations,
            permanentLock: true,
            locked: true,
            lockedAt: Date.now(),
          };
        }
        // Otherwise, standard temporary lock
        return {
          ...prev,
          phaseViolations: newViolations,
          locked: true,
          lockedAt: Date.now(),
        };
      }

      return {
        ...prev,
        phaseViolations: newViolations,
      };
    });

    return shouldLock;
  }, []);

  /** Unlock the review for another phase */
  const requestLastChance = useCallback(() => {
    setLockState((prev) => ({
      ...prev,
      locked: false,
      cooldownsUsed: prev.cooldownsUsed + 1,
      phaseViolations: 0,
    }));
  }, []);

  const allowedViolations = lockState.cooldownsUsed === 0 
    ? INITIAL_VIOLATIONS_BEFORE_LOCKOUT 
    : POST_COOLDOWN_VIOLATIONS;

  return {
    lockState,
    canRequestLastChance,
    lastChanceCooldownRemaining,
    recordViolation,
    requestLastChance,
    /** Quick checks */
    isLocked: lockState.locked || lockState.permanentLock,
    isPermanentlyLocked: lockState.permanentLock,
    isInLastChance: lockState.cooldownsUsed > 0 && !lockState.permanentLock && !lockState.locked,
    violationsBeforeLockout: allowedViolations - lockState.phaseViolations,
  };
}
