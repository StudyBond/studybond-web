"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WsClientEventInput } from "@/lib/api/types";

type DuelWebsocketOptions = {
  sessionId: number | null;
  onProgressUpdate?: (userId: number, currentQuestion: number, totalQuestions: number) => void;
  onEmojiReaction?: (userId: number, emoji: string) => void;
  onFinished?: (userId: number, examId: number) => void;
};

export function useDuelWebsocket({
  sessionId,
  onProgressUpdate,
  onEmojiReaction,
  onFinished,
}: DuelWebsocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Use refs for callbacks to avoid re-binding on every render
  const callbacksRef = useRef({ onProgressUpdate, onEmojiReaction, onFinished });
  useEffect(() => {
    callbacksRef.current = { onProgressUpdate, onEmojiReaction, onFinished };
  }, [onProgressUpdate, onEmojiReaction, onFinished]);

  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;

    async function connect() {
      try {
        const response = await fetch("/api/auth/ws-token");
        const data = await response.json();

        if (!mounted) return;

        if (!data.success || !data.token || !data.backendWsUrl) {
          throw new Error(data.message || "Could not retrieve websocket token.");
        }

        const wsUrl = `${data.backendWsUrl}/api/collaboration/sessions/${sessionId}/ws?token=${data.token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          setIsConnected(true);
          setError(null);

          // Announce ready state
          sendEvent({ type: "ready" });

          // Start pinging heartbeat every 15s to match backend COLLAB_LIMITS
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              sendEvent({ type: "heartbeat" });
            }
          }, 15000);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(event.data);
            const type = data.type;
            const payload = data.payload || {};

            if (type === "progress_update" && callbacksRef.current.onProgressUpdate) {
              callbacksRef.current.onProgressUpdate(
                payload.userId,
                payload.currentQuestion,
                payload.totalQuestions
              );
            } else if (type === "emoji_reaction" && callbacksRef.current.onEmojiReaction) {
              callbacksRef.current.onEmojiReaction(payload.userId, payload.emoji);
            } else if (type === "finished" && callbacksRef.current.onFinished) {
              callbacksRef.current.onFinished(payload.userId, payload.examId);
            } else if (type === "server_error") {
              console.error("[Duel WS] Server Error:", payload.message);
              if (payload.code === "WS_CONNECTION_REPLACED") {
                setError("Connection replaced by another tab or device.");
                ws.close();
              }
            }
          } catch (err) {
            console.error("[Duel WS] Message parse error", err);
          }
        };

        ws.onerror = (e) => {
          console.error("[Duel WS] Error", e);
        };

        ws.onclose = () => {
          if (!mounted) return;
          setIsConnected(false);
          wsRef.current = null;
          if (pingInterval) clearInterval(pingInterval);

          // Basic reconnect backoff
          reconnectTimer = setTimeout(() => {
            if (mounted && !error) {
              connect();
            }
          }, 3000);
        };
      } catch (err) {
        if (!mounted) return;
        console.error("[Duel WS] Connection failed", err);
        setError(err instanceof Error ? err.message : "Connection failed");
      }
    }

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
  }, [sessionId, error]);

  const sendEvent = useCallback((event: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          eventId: crypto.randomUUID(), // Ensure eventId for duplicate protection
          ...event,
        })
      );
    }
  }, []);

  const sendProgress = useCallback((currentQuestion: number, totalQuestions: number) => {
    sendEvent({
      type: "progress_update",
      payload: { currentQuestion, totalQuestions },
    });
  }, [sendEvent]);

  const sendEmoji = useCallback((emoji: string) => {
    sendEvent({
      type: "emoji_reaction",
      payload: { emoji },
    });
  }, [sendEvent]);

  const sendFinished = useCallback((examId: number) => {
    sendEvent({
      type: "finished",
      payload: { examId },
    });
  }, [sendEvent]);

  return {
    isConnected,
    error,
    sendProgress,
    sendEmoji,
    sendFinished,
  };
}
