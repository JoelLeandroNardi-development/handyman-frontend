import { useCallback, useState } from "react";
import {
  getMyNotifications,
  getNotificationUnreadCount,
  type NotificationItem,
} from "@smart/api";
import type { createApiClient } from "../lib/api";

type ApiClient = ReturnType<typeof createApiClient>;

export type NotificationStore = {
  items: NotificationItem[];
  loadingItems: boolean;
  unreadCount: number;
  loadingUnreadCount: boolean;
  latestCreatedNotification: NotificationItem | null;
  refreshItems: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  prependItem: (item: NotificationItem) => void;
  applyMarkRead: (notificationId: string) => void;
  applyArchive: (notificationId: string) => void;
  applyMarkAllRead: () => void;
};

/**
 * Manages notifications state: item list, unread count, and optimistic local mutations.
 * Owns one clear update path for each piece of state.
 */
export function useNotificationStore(
  api: ApiClient,
  isAuthenticated: boolean,
): NotificationStore {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [loadingUnreadCount, setLoadingUnreadCount] = useState(false);
  const [latestCreatedNotification, setLatestCreatedNotification] =
    useState<NotificationItem | null>(null);

  const refreshItems = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoadingItems(true);
    try {
      const result = await getMyNotifications(api, {
        status: null,
        limit: 50,
        cursor: null,
      });
      setItems(result.items);
    } catch {
      // Keep existing items on transient errors
    } finally {
      setLoadingItems(false);
    }
  }, [api, isAuthenticated]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
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
  }, [api, isAuthenticated]);

  /**
   * Prepends a newly received SSE notification to the item list and updates
   * the unread count in one atomic operation, avoiding competing update paths.
   * Notifications without an explicit status default to unread for counting purposes.
   */
  const prependItem = useCallback((item: NotificationItem) => {
    setLatestCreatedNotification(item);
    setItems((prev) => {
      const exists = prev.some((i) => i.notification_id === item.notification_id);
      if (exists) return prev;
      return [item, ...prev];
    });
    if (item.status === "unread" || !item.status) {
      setUnreadCountState((prev) => prev + 1);
    }
  }, []);

  const applyMarkRead = useCallback((notificationId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.notification_id === notificationId ? { ...item, status: "read" } : item,
      ),
    );
  }, []);

  const applyArchive = useCallback((notificationId: string) => {
    setItems((prev) =>
      prev.filter((item) => item.notification_id !== notificationId),
    );
  }, []);

  const applyMarkAllRead = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, status: "read" })));
    setUnreadCountState(0);
  }, []);

  return {
    items,
    loadingItems,
    unreadCount,
    loadingUnreadCount,
    latestCreatedNotification,
    refreshItems,
    refreshUnreadCount,
    prependItem,
    applyMarkRead,
    applyArchive,
    applyMarkAllRead,
  };
}
