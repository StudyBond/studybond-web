"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

// ─── Configuration ───

const EXAM_AUTO_SUBMIT_DELAY_MS = 5000; // 5 seconds countdown
const MAX_VIOLATIONS_BEFORE_INSTANT_SUBMIT = 3;
const DEVTOOLS_WIDTH_THRESHOLD = 250; // px sudden shrink
const VIOLATION_REPORT_THROTTLE_MS = 10_000; // Backend rate-limit aligned
const VIOLATION_DEDUP_WINDOW_MS = 300; // Dedup blur + visibilitychange
const GUARD_STARTUP_GRACE_MS = 2000; // Suppress false positives during load

const COPY_TOAST_MESSAGES = [
  "StudyBond protects exam integrity. Copying is disabled.",
  "Nice try — but StudyBond questions are protected.",
  "Content copying is restricted during exams.",
  "StudyBond doesn't allow copying questions.",
  "Exam content is secured. Focus on your answers.",
];

function getRandomCopyMessage() {
  return COPY_TOAST_MESSAGES[Math.floor(Math.random() * COPY_TOAST_MESSAGES.length)];
}

// ─── Types ───

export type ExamGuardMode = "exam" | "review";

export type ExamGuardState = {
  /** Whether a violation overlay is currently showing */
  violationActive: boolean;
  /** Type of the current violation */
  violationType: "tab_switch" | "screenshot" | "multi_touch" | null;
  /** Number of violations so far */
  violationCount: number;
  /** Remaining seconds on the auto-submit countdown (exam mode only) */
  countdownSeconds: number;
  /** Whether the content should be blurred (e.g. window lost focus but violation overlay not yet triggered) */
  isObscured: boolean;
};

type UseExamGuardOptions = {
  /** "exam" = full enforcement with auto-submit. "review" = content protection only. */
  mode: ExamGuardMode;
  /** Called when auto-submit is triggered (exam mode only) */
  onAutoSubmit?: () => void;
  /** Called when any violation is detected so it can be reported to the backend */
  onViolation?: (type: string, metadata?: any) => void;
  /** Whether the guard is active (set to false during loading states) */
  enabled?: boolean;
};

// ─── Hook ───

export function useExamGuard({
  mode,
  onAutoSubmit,
  onViolation,
  enabled = true,
}: UseExamGuardOptions) {
  const [state, setState] = useState<ExamGuardState>({
    violationActive: false,
    violationType: null,
    violationCount: 0,
    countdownSeconds: Math.ceil(EXAM_AUTO_SUBMIT_DELAY_MS / 1000),
    isObscured: false,
  });

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const violationCountRef = useRef(0);
  const lastWidthRef = useRef(typeof window !== "undefined" ? window.innerWidth : 0);
  const lastHeightRef = useRef(typeof window !== "undefined" ? window.innerHeight : 0);
  const lastViolationTimeRef = useRef<number>(0);
  const guardEnabledAtRef = useRef<number>(0);
  const autoSubmitRef = useRef(onAutoSubmit);
  const isTouchingRef = useRef(false);

  // Keep the callback ref fresh
  useEffect(() => {
    autoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  // ─── Dismiss violation (return to exam) ───
  const dismissViolation = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setState((s) => ({
      ...s,
      violationActive: false,
      violationType: null,
      countdownSeconds: Math.ceil(EXAM_AUTO_SUBMIT_DELAY_MS / 1000),
      isObscured: false,
    }));

    if (mode === "exam") {
      toast.warning("Stay focused — leaving the exam again may auto-submit your answers.", {
        duration: 4000,
      });
    }
  }, [mode]);

  const onViolationRef = useRef(onViolation);
  const lastReportTimeRef = useRef<number>(0);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // Track when the guard becomes enabled to suppress startup false positives
  useEffect(() => {
    if (enabled) {
      guardEnabledAtRef.current = Date.now();
    }
  }, [enabled]);

  // ─── Trigger a violation ───
  const triggerViolation = useCallback(
    (type: "tab_switch" | "screenshot" | "multi_touch") => {
      const now = Date.now();

      // ── Suppress during startup grace period ──
      if (now - guardEnabledAtRef.current < GUARD_STARTUP_GRACE_MS) {
        return;
      }

      // ── Dedup: blur + visibilitychange fire within 300ms of each other ──
      if (now - lastViolationTimeRef.current < VIOLATION_DEDUP_WINDOW_MS) {
        return;
      }
      lastViolationTimeRef.current = now;

      violationCountRef.current += 1;
      const count = violationCountRef.current;
      
      // Throttle backend reporting — aligned with server-side 10s rate-limit
      if (now - lastReportTimeRef.current > VIOLATION_REPORT_THROTTLE_MS) {
        onViolationRef.current?.(type, { count });
        lastReportTimeRef.current = now;
      }

      setState((s) => ({
        ...s,
        violationActive: true,
        violationType: type,
        violationCount: count,
        countdownSeconds: Math.ceil(EXAM_AUTO_SUBMIT_DELAY_MS / 1000),
        isObscured: true,
      }));

      // In exam mode, start auto-submit countdown
      if (mode === "exam") {
        // Instant submit if too many violations
        if (count >= MAX_VIOLATIONS_BEFORE_INSTANT_SUBMIT) {
          autoSubmitRef.current?.();
          return;
        }

        // Start countdown
        if (countdownRef.current) clearInterval(countdownRef.current);

        let remaining = Math.ceil(EXAM_AUTO_SUBMIT_DELAY_MS / 1000);

        countdownRef.current = setInterval(() => {
          remaining -= 1;
          setState((s) => ({ ...s, countdownSeconds: remaining }));

          if (remaining <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = null;
            autoSubmitRef.current?.();
          }
        }, 1000);
      }
    },
    [mode],
  );

  // ─── Layer 0: Fullscreen Enforcement (Rugged Mode) ───
  useEffect(() => {
    if (!enabled || mode !== "exam") return;

    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        // User exited fullscreen — trigger violation
        triggerViolation("tab_switch");
        toast.error("StudyBond requires Fullscreen mode for exams. Exiting fullscreen is a violation.", {
          duration: 5000,
        });
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [enabled, mode, triggerViolation]);

  // ─── Layer 1: Tab Switch / Visibility / Occlusion Detection ───
  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        triggerViolation(mode === "exam" ? "tab_switch" : "screenshot");
      }
    }

    function handleWindowBlur() {
      // Instantly obscure content on blur
      setState(s => ({ ...s, isObscured: true }));
      
      // On Mobile: focus loss during touch is extremely suspicious
      if (isTouchingRef.current) {
        triggerViolation("screenshot");
      } else {
        triggerViolation(mode === "exam" ? "tab_switch" : "screenshot");
      }
    }

    // Secondary occlusion detection for mobile browsers that don't blur immediately
    function handlePageHide() {
      triggerViolation(mode === "exam" ? "tab_switch" : "screenshot");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pagehide", handlePageHide);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [enabled, mode, triggerViolation]);

  // ─── Layer 2: Mobile Specific Heuristics & Gestures ───
  useEffect(() => {
    if (!enabled) return;

    function handleTouchStart(e: TouchEvent) {
      isTouchingRef.current = true;
      // 3-finger touch is a common screenshot gesture on Android
      if (e.touches.length >= 3) {
        e.preventDefault();
        triggerViolation("multi_touch");
      }
    }

    function handleTouchEnd() {
      isTouchingRef.current = false;
    }

    // Detect orientation change
    function handleOrientationChange() {
      setTimeout(() => {
        toast.info("Layout adjusted. Stay focused.", { duration: 2000 });
      }, 500);
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [enabled, triggerViolation]);

  // ─── Layer 3: Frame Freeze Detection (The "Rugged" Monitor) ───
  // Detects the 500ms+ freeze that happens during OS screenshot processing
  useEffect(() => {
    if (!enabled) return;

    let lastFrameTime = performance.now();
    let frameRequest: number;

    function checkFrame(time: number) {
      const delta = time - lastFrameTime;
      
      // If frame time > 600ms, the browser thread was likely suspended by the OS
      // for a screenshot capture or app switcher entry.
      if (delta > 600) {
        const now = Date.now();
        // Only trigger if we aren't already showing a violation
        if (now - guardEnabledAtRef.current > GUARD_STARTUP_GRACE_MS) {
            // This heuristic is aggressive. In "exam" mode, we treat it as a warning/violation.
            // But we only trigger if visibility is still 'visible' (meaning it was a transient freeze)
            if (document.visibilityState === "visible") {
              triggerViolation("screenshot");
            }
        }
      }
      
      lastFrameTime = time;
      frameRequest = requestAnimationFrame(checkFrame);
    }

    frameRequest = requestAnimationFrame(checkFrame);
    return () => cancelAnimationFrame(frameRequest);
  }, [enabled, triggerViolation]);

  // ─── Layer 4: Strict Viewport Occlusion Monitoring ───
  useEffect(() => {
    if (!enabled) return;

    function handleResize() {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      const widthDelta = Math.abs(lastWidthRef.current - currentWidth);
      const heightDelta = Math.abs(lastHeightRef.current - currentHeight);

      // On mobile, screenshot overlays often cause a minor viewport resize (toolbar appearing)
      // If it's a significant change (> 50px) without a keyboard being active, it's a violation.
      // We exclude minor resizes to allow for browser chrome hiding/showing.
      if (widthDelta > 10 || heightDelta > 100) {
         if (mode === "exam") {
            // Heuristic for DevTools or Screenshot UI
            if (widthDelta > DEVTOOLS_WIDTH_THRESHOLD || heightDelta > 150) {
              triggerViolation("tab_switch");
            }
         }
      }

      lastWidthRef.current = currentWidth;
      lastHeightRef.current = currentHeight;
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enabled, mode, triggerViolation]);

  // ─── Layer 5: Screenshot Key Detection ───
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;

      if (key === "PrintScreen") {
        e.preventDefault();
        triggerViolation("screenshot");
        return;
      }

      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(key)) {
        e.preventDefault();
        triggerViolation("screenshot");
        return;
      }

      if (e.metaKey && e.shiftKey && key.toLowerCase() === "s") {
        e.preventDefault();
        triggerViolation("screenshot");
        return;
      }

      if (e.ctrlKey && e.shiftKey && key.toLowerCase() === "s") {
        e.preventDefault();
        triggerViolation("screenshot");
        return;
      }

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === "p") {
        e.preventDefault();
        toast.error("Printing is disabled during exams.", { duration: 3000 });
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && key.toLowerCase() === "s") {
        e.preventDefault();
        toast.error("Saving is disabled during exams.", { duration: 3000 });
        return;
      }

      if (key === "F12" || (e.ctrlKey && e.shiftKey && key.toLowerCase() === "i")) {
        e.preventDefault();
        toast.error("Developer tools are restricted during exams.", { duration: 3000 });
        return;
      }

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === "u") {
        e.preventDefault();
        toast.error("Viewing source is restricted.", { duration: 3000 });
        return;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerViolation("screenshot");
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
    };
  }, [enabled, triggerViolation]);

  // ─── Layer 6: Copy / Cut / Select / Drag / Context Menu Prevention ───
  useEffect(() => {
    if (!enabled) return;

    function handleCopy(e: ClipboardEvent) {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      toast.error(getRandomCopyMessage(), {
        duration: 3000,
        icon: "🔒",
      });
    }

    function handleCut(e: ClipboardEvent) {
      e.preventDefault();
      toast.error(getRandomCopyMessage(), { duration: 3000, icon: "🔒" });
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      toast.error("Right-click is disabled during exams.", { duration: 2000, icon: "🛡️" });
    }

    function handleSelectStart(e: Event) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
    }

    function handleDragStart(e: DragEvent) {
      e.preventDefault();
    }

    document.addEventListener("copy", handleCopy, { capture: true });
    document.addEventListener("cut", handleCut, { capture: true });
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("cut", handleCut, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [enabled]);

  // ─── Cleanup countdown on unmount ───
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return {
    guardState: state,
    dismissViolation,
    triggerViolation,
  };
}
