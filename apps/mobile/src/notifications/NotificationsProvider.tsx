import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import type { NotificationItem } from "@smart/api";
import { createApiClient } from "../lib/api";
import { useSession } from "../auth/SessionProvider";
import { connectNotificationsStream } from "./notificationsSseClient";
import { useNotificationStore, type NotificationStore } from "./useNotificationStore";

/**
 * The public context surface — everything from the store except the internal
 * `prependItem` mutation which is consumed only by this provider.
 */
export type NotificationsContextValue = Omit<NotificationStore, "prependItem">;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Glue layer: wires the SSE transport client to the notification state store,
 * shows in-app toasts for new notifications, and seeds the initial data load.
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();
  const isAuthenticated = !!session;

  const store = useNotificationStore(api, isAuthenticated);
  const { refreshItems, refreshUnreadCount, prependItem } = store;

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

  // Initial data load when the session becomes available.
  useEffect(() => {
    void refreshItems();
    void refreshUnreadCount();
  }, [refreshItems, refreshUnreadCount]);

  // SSE stream — runs only while authenticated.
  useEffect(() => {
    if (!session) return;

    const cleanup = connectNotificationsStream(
      (item) => {
        prependItem(item);
        showCreatedToast(item);
      },
      () => {
        void refreshItems();
        void refreshUnreadCount();
      },
    );

    return cleanup;
  }, [session, prependItem, showCreatedToast, refreshItems, refreshUnreadCount]);

  // Expose everything except the internal prependItem mutation.
  const value = useMemo<NotificationsContextValue>(
    () => ({
      items: store.items,
      loadingItems: store.loadingItems,
      unreadCount: store.unreadCount,
      loadingUnreadCount: store.loadingUnreadCount,
      latestCreatedNotification: store.latestCreatedNotification,
      refreshItems: store.refreshItems,
      refreshUnreadCount: store.refreshUnreadCount,
      applyMarkRead: store.applyMarkRead,
      applyArchive: store.applyArchive,
      applyMarkAllRead: store.applyMarkAllRead,
    }),
    [
      store.items,
      store.loadingItems,
      store.unreadCount,
      store.loadingUnreadCount,
      store.latestCreatedNotification,
      store.refreshItems,
      store.refreshUnreadCount,
      store.applyMarkRead,
      store.applyArchive,
      store.applyMarkAllRead,
    ],
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