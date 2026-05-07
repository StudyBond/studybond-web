"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Backend event type constants ───
// Mirrors COLLAB_WEBSOCKET_EVENTS from the backend to avoid magic strings.
const WS_EVENTS = {
  PROGRESS_UPDATE: "progress_update",
  EMOJI_REACTION: "emoji_reaction",
  FINISHED: "finished",
  SESSION_STARTED: "session_started",
  SESSION_COMPLETED: "session_completed",
  SESSION_CANCELLED: "session_cancelled",
  SESSION_NAME_UPDATED: "session_name_updated",
  PRESENCE_UPDATE: "presence_update",
  SERVER_ERROR: "server_error",
  CONNECTION_REPLACED: "connection_replaced",
  HEARTBEAT_ACK: "heartbeat_ack",
} as const;

// ─── Presence participant shape ───
type PresenceParticipant = {
  userId: number;
  participantState: string;
  online: boolean;
};

// ─── Standing shape from session_completed ───
type CompletionStanding = {
  userId: number;
  fullName: string;
  score: number;
  spEarned: number;
  rank: number;
};

type DuelWebsocketOptions = {
  /** The collaboration session ID. Pass null to disable. */
  sessionId: number | null;

  /**
   * The current user's ID. Used to filter out events the sender
   * themselves emitted (the backend broadcasts to all subscribers,
   * including the originator).
   */
  myUserId: number | null;

  // ─── Per-event callbacks ───
  onProgressUpdate?: (fromUserId: number, currentQuestion: number, totalQuestions: number) => void;
  onEmojiReaction?: (fromUserId: number, emoji: string) => void;
  onFinished?: (fromUserId: number, examId: number) => void;
  onSessionStarted?: (payload: {
    sessionId: number;
    startedAt: string;
    expiresAt: string;
    timeAllowedSeconds: number;
    examAssignments: Array<{ userId: number; examId: number }>;
  }) => void;
  onSessionCompleted?: (payload: {
    sessionId: number;
    completedAt: string;
    standings: CompletionStanding[];
  }) => void;
  onSessionCancelled?: (payload: { sessionId: number; endedAt: string }) => void;
  onPresenceUpdate?: (payload: {
    sessionId: number;
    participants: PresenceParticipant[];
  }) => void;
  onSessionNameUpdated?: (payload: {
    sessionId: number;
    customName: string | null;
    effectiveDisplayName: string;
  }) => void;
};

/**
 * Manages a single WebSocket connection to the collaboration session.
 *
 * Design constraints:
 * - The backend broadcasts every emitted event to ALL subscribers in the
 *   session, including the originator. We use `myUserId` to suppress
 *   self-echo for per-user events (progress, emoji, finished).
 * - The backend injects `fromUserId` into the payload of client-emitted
 *   events. Server-originated lifecycle events do NOT carry `fromUserId`.
 * - Reconnection is automatic with linear backoff, but halts permanently
 *   when the server sends a terminal error (e.g. connection replaced).
 */
export function useDuelWebsocket({
  sessionId,
  myUserId,
  onProgressUpdate,
  onEmojiReaction,
  onFinished,
  onSessionStarted,
  onSessionCompleted,
  onSessionCancelled,
  onPresenceUpdate,
  onSessionNameUpdated,
}: DuelWebsocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Track terminal errors via ref to avoid placing `error` in the
  // useEffect dependency array (which would cause a reconnect loop).
  const terminalErrorRef = useRef(false);

  // Stable callback refs — avoids tearing down the WS on every render
  // while ensuring handlers always invoke the latest closure.
  const callbacksRef = useRef({
    onProgressUpdate,
    onEmojiReaction,
    onFinished,
    onSessionStarted,
    onSessionCompleted,
    onSessionCancelled,
    onPresenceUpdate,
    onSessionNameUpdated,
  });
  useEffect(() => {
    callbacksRef.current = {
      onProgressUpdate,
      onEmojiReaction,
      onFinished,
      onSessionStarted,
      onSessionCompleted,
      onSessionCancelled,
      onPresenceUpdate,
      onSessionNameUpdated,
    };
  }, [
    onProgressUpdate,
    onEmojiReaction,
    onFinished,
    onSessionStarted,
    onSessionCompleted,
    onSessionCancelled,
    onPresenceUpdate,
    onSessionNameUpdated,
  ]);

  // Store myUserId in a ref so the message handler always reads the
  // latest value without being a dependency of the connection effect.
  const myUserIdRef = useRef(myUserId);
  useEffect(() => {
    myUserIdRef.current = myUserId;
  }, [myUserId]);

  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectAttempts = 0;

    function scheduleReconnect() {
      if (!mounted || terminalErrorRef.current) return;

      // Linear backoff: 3s, 6s, 9s... capped at 30s.
      reconnectAttempts += 1;
      const delay = Math.min(reconnectAttempts * 3000, 30_000);
      reconnectTimer = setTimeout(() => {
        if (mounted && !terminalErrorRef.current) {
          connect();
        }
      }, delay);
    }

    function handleTerminalError(message: string) {
      terminalErrorRef.current = true;
      setError(message);
    }

    /**
     * Dispatches a parsed WebSocket message to the appropriate callback.
     *
     * For client-originated events (progress, emoji, finished), the
     * backend injects `fromUserId` into the payload. We use this to
     * suppress self-echo: the sender should not react to their own
     * broadcast.
     */
    function dispatchMessage(type: string, payload: Record<string, unknown>) {
      const fromUserId = payload.fromUserId as number | undefined;
      const isSelfEcho =
        typeof fromUserId === "number" &&
        typeof myUserIdRef.current === "number" &&
        fromUserId === myUserIdRef.current;

      switch (type) {
        case WS_EVENTS.PROGRESS_UPDATE: {
          if (isSelfEcho || !fromUserId) return;
          callbacksRef.current.onProgressUpdate?.(
            fromUserId,
            payload.currentQuestion as number,
            payload.totalQuestions as number,
          );
          return;
        }
        case WS_EVENTS.EMOJI_REACTION: {
          if (isSelfEcho || !fromUserId) return;
          callbacksRef.current.onEmojiReaction?.(
            fromUserId,
            payload.emoji as string,
          );
          return;
        }
        case WS_EVENTS.FINISHED: {
          if (isSelfEcho) return;
          // `finished` events carry `userId` (not `fromUserId`) when
          // emitted by the service layer directly. Fall back gracefully.
          const finishedUserId = fromUserId ?? (payload.userId as number | undefined);
          if (!finishedUserId) return;
          callbacksRef.current.onFinished?.(
            finishedUserId,
            payload.examId as number,
          );
          return;
        }

        // ─── Server-originated lifecycle events ───
        case WS_EVENTS.SESSION_STARTED: {
          callbacksRef.current.onSessionStarted?.(
            payload as unknown as Parameters<NonNullable<DuelWebsocketOptions["onSessionStarted"]>>[0],
          );
          return;
        }
        case WS_EVENTS.SESSION_COMPLETED: {
          callbacksRef.current.onSessionCompleted?.(
            payload as unknown as Parameters<NonNullable<DuelWebsocketOptions["onSessionCompleted"]>>[0],
          );
          return;
        }
        case WS_EVENTS.SESSION_CANCELLED: {
          callbacksRef.current.onSessionCancelled?.(
            payload as unknown as Parameters<NonNullable<DuelWebsocketOptions["onSessionCancelled"]>>[0],
          );
          return;
        }
        case WS_EVENTS.PRESENCE_UPDATE: {
          callbacksRef.current.onPresenceUpdate?.(
            payload as unknown as Parameters<NonNullable<DuelWebsocketOptions["onPresenceUpdate"]>>[0],
          );
          return;
        }
        case WS_EVENTS.SESSION_NAME_UPDATED: {
          callbacksRef.current.onSessionNameUpdated?.(
            payload as unknown as Parameters<NonNullable<DuelWebsocketOptions["onSessionNameUpdated"]>>[0],
          );
          return;
        }

        // ─── Infrastructure events ───
        case WS_EVENTS.SERVER_ERROR: {
          console.error("[Duel WS] Server error:", payload.message);
          if (payload.code === "WS_CONNECTION_REPLACED") {
            handleTerminalError("Connection replaced by another tab or device.");
            wsRef.current?.close();
          }
          return;
        }
        case WS_EVENTS.CONNECTION_REPLACED: {
          handleTerminalError("This session was opened from another connection.");
          wsRef.current?.close();
          return;
        }
        case WS_EVENTS.HEARTBEAT_ACK: {
          // Heartbeat acknowledged — no action needed.
          return;
        }
        default: {
          // Unknown event types are logged but never crash the handler.
          if (process.env.NODE_ENV === "development") {
            console.debug("[Duel WS] Unhandled event type:", type, payload);
          }
        }
      }
    }

    async function connect() {
      try {
        const response = await fetch("/api/auth/ws-token");
        const tokenData = await response.json();

        if (!mounted) return;

        if (!tokenData.success || !tokenData.token || !tokenData.backendWsUrl) {
          throw new Error(tokenData.message || "Could not retrieve websocket token.");
        }

        const wsUrl = `${tokenData.backendWsUrl}/api/collaboration/sessions/${sessionId}/ws?token=${tokenData.token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0;

          // Announce ready state directly on the socket to avoid
          // the circular reference through the `sendEvent` callback.
          ws.send(JSON.stringify({ type: "ready", eventId: crypto.randomUUID() }));

          // Heartbeat every 15s — matches backend COLLAB_LIMITS.HEARTBEAT_PING_INTERVAL_SECONDS.
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "heartbeat", eventId: crypto.randomUUID() }));
            }
          }, 15_000);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const parsed = JSON.parse(event.data as string);
            dispatchMessage(parsed.type, parsed.payload ?? {});
          } catch (err) {
            console.error("[Duel WS] Failed to parse message:", err);
          }
        };

        ws.onerror = () => {
          // The browser fires `onerror` before `onclose`. We handle
          // reconnection in `onclose` to avoid duplicate attempts.
        };

        ws.onclose = () => {
          if (!mounted) return;
          setIsConnected(false);
          wsRef.current = null;
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          scheduleReconnect();
        };
      } catch (err) {
        if (!mounted) return;
        console.error("[Duel WS] Connection failed:", err);
        setError(err instanceof Error ? err.message : "Connection failed");
        scheduleReconnect();
      }
    }

    // Reset terminal error flag when the session changes.
    terminalErrorRef.current = false;
    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // `sessionId` is the only external dependency. Callbacks and myUserId
    // are accessed via refs to keep the connection stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ─── Outbound helpers ───

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          eventId: crypto.randomUUID(),
          ...event,
        }),
      );
    }
  }, []);

  const sendProgress = useCallback(
    (currentQuestion: number, totalQuestions: number) => {
      sendEvent({
        type: "progress_update",
        payload: { currentQuestion, totalQuestions },
      });
    },
    [sendEvent],
  );

  const sendEmoji = useCallback(
    (emoji: string) => {
      sendEvent({
        type: "emoji_reaction",
        payload: { emoji },
      });
    },
    [sendEvent],
  );

  const sendFinished = useCallback(
    (examId: number) => {
      sendEvent({
        type: "finished",
        payload: { examId },
      });
    },
    [sendEvent],
  );

  return {
    isConnected,
    error,
    sendProgress,
    sendEmoji,
    sendFinished,
  };
}
