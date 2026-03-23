import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import {
  buildNotificationsStreamUrl,
  getNotificationUnreadCount,
  type NotificationItem,
} from "@smart/api";
import { API_BASE_URL, createApiClient } from "../lib/api";
import { useSession } from "../auth/SessionProvider";
import { getStoredToken } from "../auth/session";

type NotificationsContextValue = {
  unreadCount: number;
  loadingUnreadCount: boolean;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  latestCreatedNotification: NotificationItem | null;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

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

function parseSseNotification(data: string): NotificationItem | null {
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

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();
  const [unreadCount, setUnreadCountState] = useState(0);
  const [loadingUnreadCount, setLoadingUnreadCount] = useState(false);
  const [latestCreatedNotification, setLatestCreatedNotification] =
    useState<NotificationItem | null>(null);

  const showCreatedToast = useCallback((item: NotificationItem) => {
    const title =
      (typeof item.title === "string" && item.title.trim().length > 0 ? item.title : null) ||
      (typeof item.type === "string" && item.type.trim().length > 0 ? item.type : null) ||
      "New notification";

    if (Platform.OS === "android") {
      ToastAndroid.show(title, ToastAndroid.SHORT);
      return;
    }

    Alert.alert("New notification", title);
  }, []);

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!session) {
      setUnreadCountState(0);
      return;
    }

    setLoadingUnreadCount(true);
    try {
      const result = await getNotificationUnreadCount(api);
      setUnreadCountState(Math.max(0, result.unread_count));
    } catch {
      setUnreadCountState(0);
    } finally {
      setLoadingUnreadCount(false);
    }
  }, [api, session]);

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    let closed = false;
    let closeStream: (() => void) | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const MAX_BACKOFF_MS = 30_000;
    const BASE_DELAY_MS = 1_000;

    function backoffDelay(n: number): number {
      return Math.min(BASE_DELAY_MS * Math.pow(2, n), MAX_BACKOFF_MS);
    }

    const scheduleReconnect = () => {
      if (closed) return;
      const delay = backoffDelay(attempt);
      attempt += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connect();
      }, delay);
    };

    const connect = async () => {
      if (!session || closed) return;

      const EventSourceCtor = (globalThis as unknown as { EventSource?: new (url: string) => {
        onmessage: ((event: { data?: string }) => void) | null;
        onerror: (() => void) | null;
        addEventListener?: (
          type: string,
          listener: (event: { data?: string }) => void,
        ) => void;
        close: () => void;
        readyState?: number;
        CLOSED?: number;
      } }).EventSource;

      if (!EventSourceCtor) {
        pollTimer = setInterval(() => {
          void refreshUnreadCount();
        }, 30000);
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

          setLatestCreatedNotification(next);
          if (next.status === "unread" || !next.status) {
            setUnreadCountState((prev) => prev + 1);
          }
          showCreatedToast(next);
        } catch {
          // Malformed SSE payload — ignore
        }
      };

      source.addEventListener?.("notification.created", handleIncomingEvent);

      source.onmessage = (event: { data?: string }) => {
        // Reset backoff on any successful message (including "ready" / "ping")
        attempt = 0;
        handleIncomingEvent(event);
      };

      source.onerror = () => {
        // EventSource API does not expose HTTP status codes.
        // On any error (401, network drop, etc.) close and schedule a
        // reconnect with exponential backoff. If the token has expired
        // the next connect() call will fetch a fresh one via getStoredToken()
        // (which reads from SecureStore after the ApiClient refresh cycle).
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
  }, [session, showCreatedToast, refreshUnreadCount]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      unreadCount,
      loadingUnreadCount,
      refreshUnreadCount,
      setUnreadCount,
      latestCreatedNotification,
    }),
    [
      unreadCount,
      loadingUnreadCount,
      refreshUnreadCount,
      setUnreadCount,
      latestCreatedNotification,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}