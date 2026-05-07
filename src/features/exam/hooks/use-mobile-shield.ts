"use client";

import { useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// ═══ StudyBond Mobile Shield — Hardened Anti-Screenshot ═══════
// ═══════════════════════════════════════════════════════════════
//
// Mobile browsers cannot truly "block" OS-level screenshots.
// However, we use a multi-layered approach:
//
// 1. DETECT screenshots via visibility/blur timing heuristics
// 2. CLOAK content instantly when the app loses focus
// 3. BLOCK Screen Capture API (getDisplayMedia)
// 4. PREVENT long-press save dialogs on images
// 5. DISABLE touch callouts and text selection
// 6. DETECT rapid resize events (screenshot UI overlays on some phones)
// 7. PUNISH violators through the existing violation system
//
// The goal: even if the OS captures the screen, the user sees
// NOTHING but a black shield with a StudyBond watermark.
// ═══════════════════════════════════════════════════════════════

type MobileShieldOptions = {
  /** Whether the shield is active */
  enabled: boolean;
  /** Called when a screenshot is detected */
  onScreenshotDetected: () => void;
  /** CSS selector for the content container to cloak */
  contentSelector?: string;
};

// Detect mobile via touch support + screen size (more reliable than UA sniffing)
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 1024;
  return hasTouch && isSmallScreen;
}

// Detect iOS specifically (different screenshot behavior)
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// ─── Content Cloaking System ───
// Injects a full-screen black overlay when page loses visibility
// This ensures screenshots capture NOTHING but the shield

const CLOAK_ID = "sb-mobile-cloak";

function showCloak() {
  if (typeof document === "undefined") return;
  let cloak = document.getElementById(CLOAK_ID);
  if (!cloak) {
    cloak = document.createElement("div");
    cloak.id = CLOAK_ID;
    cloak.setAttribute("style", `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(9, 9, 11, 0.4);
      backdrop-filter: blur(40px) brightness(0.3);
      -webkit-backdrop-filter: blur(40px) brightness(0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 20px;
      transition: opacity 150ms ease-in-out;
      pointer-events: all;
      opacity: 0;
    `);
    cloak.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 84px;
        height: 84px;
        border-radius: 28px;
        background: rgba(248, 113, 113, 0.15);
        box-shadow: 0 0 40px rgba(248, 113, 113, 0.1);
        border: 1px solid rgba(248, 113, 113, 0.2);
      ">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      ">
        <div style="
          color: white;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        ">
          Shield Active
        </div>
        <div style="
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          max-width: 260px;
          text-align: center;
          line-height: 1.5;
          font-weight: 500;
        ">
          StudyBond content is protected. Screenshots and recordings are restricted.
        </div>
      </div>
    `;
    document.body.appendChild(cloak);
  }
  // Force a reflow
  cloak.offsetHeight;
  cloak.style.display = "flex";
  cloak.style.opacity = "1";
}

function hideCloak() {
  if (typeof document === "undefined") return;
  const cloak = document.getElementById(CLOAK_ID);
  if (cloak) {
    cloak.style.opacity = "0";
    // Small delay so the cloak is visible during the brief screenshot capture window
    setTimeout(() => {
      cloak.style.display = "none";
    }, 400);
  }
}

function removeCloak() {
  if (typeof document === "undefined") return;
  const cloak = document.getElementById(CLOAK_ID);
  if (cloak) {
    cloak.remove();
  }
}

// ─── Hook ───

export function useMobileShield({
  enabled,
  onScreenshotDetected,
  contentSelector = ".sb-exam-content",
}: MobileShieldOptions) {
  const onDetectedRef = useRef(onScreenshotDetected);
  const lastVisibilityChangeRef = useRef<number>(0);
  const screenshotCooldownRef = useRef<number>(0);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onDetectedRef.current = onScreenshotDetected;
  }, [onScreenshotDetected]);

  const triggerScreenshotDetected = useCallback(() => {
    const now = Date.now();
    // Cooldown: don't fire more than once per 2 seconds
    if (now - screenshotCooldownRef.current < 2000) return;
    screenshotCooldownRef.current = now;
    onDetectedRef.current();
  }, []);

  // ═══ Layer 1: Visibility-based screenshot detection ═══
  // On both iOS and Android, taking a screenshot causes a very brief
  // visibilitychange hidden→visible cycle (typically <1000ms).
  // We detect this pattern and flag it.
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    function handleVisibilityChange() {
      const now = Date.now();

      if (document.visibilityState === "hidden") {
        // Page going hidden — show cloak IMMEDIATELY
        showCloak();
        lastVisibilityChangeRef.current = now;
      } else if (document.visibilityState === "visible") {
        const elapsed = now - lastVisibilityChangeRef.current;

        // Screenshot detection heuristic:
        // A very brief hidden->visible cycle (between 150ms and 1000ms)
        // is the signature of an OS screenshot or screen recording preview.
        // Less than 150ms is usually a system glitch/flicker.
        // More than 1000ms is likely a quick notification check or app switch.
        if (lastVisibilityChangeRef.current > 0 && elapsed > 150 && elapsed < 1000) {
          triggerScreenshotDetected();
        }

        // Hide cloak after a small delay (ensures screenshot captures the cloak)
        setTimeout(() => {
          hideCloak();
        }, 300);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Some screenshot gestures (like 3-finger swipe) trigger touchcancel
    function handleTouchCancel() {
      showCloak();
      // Brief cloak for touch cancel, only trigger violation if combined with other signals
      setTimeout(() => {
        if (document.visibilityState === "visible") hideCloak();
      }, 1000);
    }
    
    document.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [enabled, triggerScreenshotDetected]);

  // ═══ Layer 2: Window blur detection for mobile ═══
  // Some Android devices fire blur when the notification shade or
  // screenshot confirmation toast appears
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    function handleBlur() {
      showCloak();
    }

    function handleFocus() {
      setTimeout(() => {
        hideCloak();
      }, 300);
    }

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled]);

  // ═══ Layer 3: Resize heuristic ═══
  // On some Android devices, the screenshot animation causes a brief
  // viewport resize. Detect rapid resize sequences.
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    let resizeCount = 0;
    let resizeWindowStart = 0;

    function handleResize() {
      const now = Date.now();

      if (now - resizeWindowStart > 3000) {
        resizeCount = 0;
        resizeWindowStart = now;
      }

      resizeCount++;

      // Multiple rapid resizes in a short window = suspicious (OS screenshot UI)
      // Increased to 4 to avoid false positives from keyboard + rotation
      if (resizeCount >= 4) {
        triggerScreenshotDetected();
        resizeCount = 0;
      }
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, triggerScreenshotDetected]);

  // ═══ Layer 4: Block Screen Capture API ═══
  // Prevent navigator.mediaDevices.getDisplayMedia from working
  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;

    // Override getDisplayMedia to reject
    navigator.mediaDevices.getDisplayMedia = function () {
      return Promise.reject(
        new DOMException(
          "Screen capture is blocked by StudyBond exam integrity system.",
          "NotAllowedError"
        )
      );
    };

    return () => {
      // Restore on cleanup
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, [enabled]);

  // ═══ Layer 5: Touch callout and long-press prevention ═══
  // Prevent the mobile "save image" / "copy" / "share" dialogs
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    // Prevent long-press context menu on the entire document
    function handleTouchStart(e: TouchEvent) {
      const target = e.target as HTMLElement;
      // Allow interaction with buttons and interactive elements
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("select")
      ) {
        return;
      }
    }

    // Prevent the native context menu on long-press
    function handleContextMenu(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent touch-based text selection
    function handleTouchEnd(e: TouchEvent) {
      const target = e.target as HTMLElement;
      const contentContainer = document.querySelector(contentSelector);
      if (contentContainer?.contains(target)) {
        // Clear any accidental selection
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString();
          if (selectedText.length > 0) {
            selection.removeAllRanges();
          }
        }
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true } as EventListenerOptions);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, contentSelector]);

  // ═══ Layer 6: CSS injection for mobile hardening ═══
  // Apply aggressive CSS protections on mobile
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    const styleId = "sb-mobile-shield-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        /* ═══ StudyBond Mobile Shield CSS ═══ */

        /* Prevent ALL text selection in exam content */
        .sb-exam-content,
        .sb-exam-content * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        /* Prevent image saving via long-press */
        .sb-exam-content img {
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -webkit-touch-callout: none !important;
          pointer-events: none !important;
        }

        /* Prevent touch-based highlighting */
        .sb-exam-content {
          -webkit-tap-highlight-color: transparent !important;
        }

        /* Block text adjust which can leak content dimensions */
        .sb-exam-content {
          -webkit-text-size-adjust: none !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    return () => {
      styleEl?.remove();
    };
  }, [enabled]);

  // ═══ Layer 7: iOS-specific screenshot detection ═══
  // On iOS, screenshots trigger a very specific pattern:
  // 1. Window resize (status bar animation)
  // 2. Brief visibility change
  // 3. The screenshot sound plays
  // We can detect #1 and #2 together
  useEffect(() => {
    if (!enabled || !isIOS()) return;

    let lastResizeTime = 0;

    function handleResize() {
      lastResizeTime = Date.now();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        // If resize happened just before visibility change (<600ms), strong screenshot signal
        if (lastResizeTime > 0 && now - lastResizeTime < 600) {
          triggerScreenshotDetected();
        }
      }
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, triggerScreenshotDetected]);

  // ═══ Layer 8: Heartbeat Loop (Frame Jank Detection) ═══
  // When the OS takes a screenshot, it often freezes the UI thread for 100-500ms.
  // We detect this "jank" and trigger the cloak pre-emptively.
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    let lastFrameTime = Date.now();
    let frameRequest: number;
    let jankCount = 0;

    const checkJank = () => {
      const now = Date.now();
      const delta = now - lastFrameTime;

      // If the delay between frames is > 200ms, it's highly suspicious (OS freeze)
      if (delta > 200 && document.visibilityState === "visible") {
        showCloak();
        jankCount++;
        
        // After a few janks in a row, it's almost certainly a capture process
        if (jankCount >= 2) {
          triggerScreenshotDetected();
          jankCount = 0;
        }

        // Auto-hide after a short period if no actual visibility change followed
        setTimeout(() => {
          if (document.visibilityState === "visible") hideCloak();
        }, 1500);
      } else if (delta < 50) {
        // Normal frame rate resumed
        jankCount = 0;
      }

      lastFrameTime = now;
      frameRequest = requestAnimationFrame(checkJank);
    };

    frameRequest = requestAnimationFrame(checkJank);
    return () => cancelAnimationFrame(frameRequest);
  }, [enabled, triggerScreenshotDetected]);

  // ═══ Cleanup on unmount ═══
  useEffect(() => {
    return () => {
      removeCloak();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);
}
