import { buildNotificationsStreamUrl, type NotificationItem } from "@smart/api";
import { API_BASE_URL } from "../lib/api";
import { getStoredToken } from "../auth/session";

const MAX_BACKOFF_MS = 30_000;
const BASE_DELAY_MS = 1_000;

function backoffDelay(attempt: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
}

function toNotificationItem(payload: Record<string, unknown>): NotificationItem {
  const idValue = payload.notification_id ?? payload.id;
  return {
    ...(payload as NotificationItem),
    notification_id:
      typeof idValue === "string" && idValue.length > 0
        ? idValue
        : `notification-${Date.now()}`,
  };
}

export function parseSseNotification(data: string): NotificationItem | null {
  const parsed = JSON.parse(data) as {
    event?: string;
    data?: Record<string, unknown>;
    [key: string]: unknown;
  };

  if (parsed.event) {
    if (parsed.event !== "notification.created") return null;
    if (!parsed.data || typeof parsed.data !== "object") return null;
    return toNotificationItem(parsed.data);
  }

  return toNotificationItem(parsed as Record<string, unknown>);
}

export type SseNotificationCallback = (item: NotificationItem) => void;

/**
 * Connects to the notifications SSE stream with automatic reconnect (exponential backoff).
 * Falls back to polling via `onPoll` if EventSource is unavailable in the runtime.
 * Returns a cleanup function that closes the connection and cancels any pending timers.
 */
export function connectNotificationsStream(
  onNotification: SseNotificationCallback,
  onPoll: () => void,
): () => void {
  let closed = false;
  let closeStream: (() => void) | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;

  const scheduleReconnect = () => {
    if (closed) return;
    const delay = backoffDelay(attempt);
    attempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, delay);
  };

  const EventSourceCtor = (
    globalThis as unknown as {
      EventSource?: new (url: string) => {
        onmessage: ((event: { data?: string }) => void) | null;
        onerror: (() => void) | null;
        addEventListener?: (
          type: string,
          listener: (event: { data?: string }) => void,
        ) => void;
        close: () => void;
        readyState?: number;
        CLOSED?: number;
      };
    }
  ).EventSource;

  const connect = async () => {
    if (closed) return;

    if (!EventSourceCtor) {
      pollTimer = setInterval(onPoll, 30_000);
      return;
    }

    const token = await getStoredToken();
    if (!token || closed) return;

    const streamUrl = buildNotificationsStreamUrl(API_BASE_URL, token);
    const source = new EventSourceCtor(streamUrl);

    const handleIncomingEvent = (event: { data?: string }) => {
      if (!event?.data) return;
      try {
        const next = parseSseNotification(event.data);
        if (!next) return;
        onNotification(next);
      } catch {
        // Malformed SSE payloads are silently ignored
      }
    };

    source.addEventListener?.("notification.created", handleIncomingEvent);

    source.onmessage = (event: { data?: string }) => {
      attempt = 0;
      handleIncomingEvent(event);
    };

    source.onerror = () => {
      source.close();
      closeStream = null;
      scheduleReconnect();
    };

    closeStream = () => source.close();
  };

  void connect();

  return () => {
    closed = true;
    closeStream?.();
    if (pollTimer) clearInterval(pollTimer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };
}
