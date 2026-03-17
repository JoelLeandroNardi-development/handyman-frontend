import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import {
  archiveNotification,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@smart/api";
import { createApiClient } from "../lib/api";
import { useTheme } from "../theme";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useNotifications } from "../notifications/NotificationsProvider";
import {
  AppButton,
  Card,
  EmptyState,
  PageHeader,
  Screen,
} from "../ui/primitives";
import { NOTIFICATION_EVENT_LABELS } from "@smart/core";

function getNotificationTitle(item: NotificationItem) {
  if (typeof item.title === "string" && item.title.trim().length > 0) return item.title;
  if (typeof item.type === "string" && item.type.trim().length > 0) {
    return NOTIFICATION_EVENT_LABELS[item.type as keyof typeof NOTIFICATION_EVENT_LABELS] ?? item.type;
  }
  return "Notification";
}

function getNotificationBody(item: NotificationItem) {
  if (typeof item.body === "string" && item.body.trim().length > 0) return item.body;
  if (typeof item.message === "string" && item.message.trim().length > 0) return item.message;
  return "Open this notification for details.";
}

function isUnread(item: NotificationItem) {
  return item.status === "unread";
}

export default function NotificationsScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { setUnreadCount, refreshUnreadCount, latestCreatedNotification } =
    useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);

  const { execute: loadNotifications, loading } = useAsyncOperation({
    alertTitle: "Load Notifications",
  });

  const { execute: runAction, loading: actionLoading } = useAsyncOperation({
    alertTitle: "Notifications",
  });

  const loadNotificationsList = React.useCallback(async () => {
    const result = await getMyNotifications(api, { status: null, limit: 50, cursor: null });
    setItems(result.items);
    const unread = result.items.filter(isUnread).length;
    setUnreadCount(unread);
  }, [api, setUnreadCount]);

  useEffect(() => {
    loadNotifications(loadNotificationsList);
  }, [loadNotificationsList]);

  useEffect(() => {
    if (!isFocused) return;

    const pollTimer = setInterval(() => {
      loadNotifications(loadNotificationsList);
    }, 30000);

    return () => clearInterval(pollTimer);
  }, [isFocused, loadNotifications, loadNotificationsList]);

  useEffect(() => {
    if (!latestCreatedNotification) return;

    setItems((prev) => {
      const exists = prev.some(
        (item) => item.notification_id === latestCreatedNotification.notification_id,
      );
      if (exists) return prev;
      return [latestCreatedNotification, ...prev];
    });
  }, [latestCreatedNotification]);

  const reload = () => {
    loadNotifications(loadNotificationsList);
  };

  const onMarkRead = (notificationId: string) => {
    runAction(async () => {
      await markNotificationRead(api, notificationId);
      setItems((prev) =>
        prev.map((item) =>
          item.notification_id === notificationId
            ? {
                ...item,
                status: "read",
              }
            : item,
        ),
      );
      await refreshUnreadCount();
    });
  };

  const onArchive = (notificationId: string) => {
    runAction(async () => {
      await archiveNotification(api, notificationId);
      setItems((prev) => prev.filter((item) => item.notification_id !== notificationId));
      await refreshUnreadCount();
    });
  };

  const onMarkAllRead = () => {
    runAction(async () => {
      await markAllNotificationsRead(api);
      setItems((prev) => prev.map((item) => ({ ...item, status: "read" })));
      setUnreadCount(0);
      await refreshUnreadCount();
    });
  };

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(item) => item.notification_id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}
        refreshing={loading}
        onRefresh={reload}
        ListHeaderComponent={
          <PageHeader
            title="Notifications"
            subtitle="Updates about bookings and slots"
            action={
              <AppButton
                label="Read all"
                tone="secondary"
                onPress={onMarkAllRead}
                disabled={items.length === 0 || actionLoading}
              />
            }
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState text="No notifications. You are all caught up." />
          )
        }
        renderItem={({ item }) => {
          const unread = isUnread(item);

          return (
            <Card
              style={{
                borderColor: unread ? colors.primary : colors.border,
              }}
            >
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                  {getNotificationTitle(item)}
                </Text>
                <Text style={{ color: colors.textSoft, fontSize: 14 }}>
                  {getNotificationBody(item)}
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <AppButton
                  label={unread ? "Mark read" : "Read"}
                  tone="secondary"
                  onPress={() => onMarkRead(item.notification_id)}
                  disabled={!unread || actionLoading}
                  style={{ flex: 1 }}
                />
                <AppButton
                  label="Archive"
                  tone="surface"
                  onPress={() => onArchive(item.notification_id)}
                  disabled={actionLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}