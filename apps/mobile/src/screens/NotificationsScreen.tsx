import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  archiveNotification,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '@smart/api';
import { createApiClient } from '../lib/api';
import { useTheme } from '../theme';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { useBottomGuard } from '../hooks/useBottomGuard';
import { useNotifications } from '../notifications/NotificationsProvider';
import { AppButton, Card, EmptyState } from '../ui/primitives';
import { ModalScreen } from '../ui/ModalScreen';
import { ScreenHeader } from '../ui/ScreenHeader';
import { NOTIFICATION_EVENT_LABELS } from '@smart/core';

function getNotificationTitle(item: NotificationItem) {
  if (typeof item.title === 'string' && item.title.trim().length > 0)
    return item.title;
  if (typeof item.type === 'string' && item.type.trim().length > 0) {
    return (
      NOTIFICATION_EVENT_LABELS[
        item.type as keyof typeof NOTIFICATION_EVENT_LABELS
      ] ?? item.type
    );
  }
  return 'Notification';
}

function getNotificationBody(item: NotificationItem) {
  if (typeof item.body === 'string' && item.body.trim().length > 0)
    return item.body;
  if (typeof item.message === 'string' && item.message.trim().length > 0)
    return item.message;
  return 'Open this notification for details.';
}

function isUnread(item: NotificationItem) {
  return item.status === 'unread';
}

type PendingNotificationAction =
  | { kind: 'mark-all-read' }
  | { kind: 'mark-read'; notificationId: string }
  | { kind: 'archive'; notificationId: string }
  | null;

export default function NotificationsScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { setUnreadCount, refreshUnreadCount, latestCreatedNotification } =
    useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pendingAction, setPendingAction] =
    useState<PendingNotificationAction>(null);
  const { bottomGuardHeight, bottomContentPadding } = useBottomGuard();

  const { execute: loadNotifications, loading } = useAsyncOperation({
    alertTitle: 'Load Notifications',
  });

  const { execute: runAction, loading: actionLoading } = useAsyncOperation({
    alertTitle: 'Notifications',
  });

  const loadNotificationsList = React.useCallback(async () => {
    const result = await getMyNotifications(api, {
      status: null,
      limit: 50,
      cursor: null,
    });
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

    setItems(prev => {
      const exists = prev.some(
        item =>
          item.notification_id === latestCreatedNotification.notification_id,
      );
      if (exists) return prev;
      return [latestCreatedNotification, ...prev];
    });
  }, [latestCreatedNotification]);

  const reload = () => {
    loadNotifications(loadNotificationsList);
  };

  const onMarkRead = (notificationId: string) => {
    if (actionLoading) {
      return;
    }

    setPendingAction({ kind: 'mark-read', notificationId });
    runAction(async () => {
      try {
        await markNotificationRead(api, notificationId);
        setItems(prev =>
          prev.map(item =>
            item.notification_id === notificationId
              ? {
                  ...item,
                  status: 'read',
                }
              : item,
          ),
        );
        await refreshUnreadCount();
      } finally {
        setPendingAction(null);
      }
    });
  };

  const onArchive = (notificationId: string) => {
    if (actionLoading) {
      return;
    }

    setPendingAction({ kind: 'archive', notificationId });
    runAction(async () => {
      try {
        await archiveNotification(api, notificationId);
        setItems(prev =>
          prev.filter(item => item.notification_id !== notificationId),
        );
        await refreshUnreadCount();
      } finally {
        setPendingAction(null);
      }
    });
  };

  const onMarkAllRead = () => {
    if (actionLoading) {
      return;
    }

    setPendingAction({ kind: 'mark-all-read' });
    runAction(async () => {
      try {
        await markAllNotificationsRead(api);
        setItems(prev => prev.map(item => ({ ...item, status: 'read' })));
        setUnreadCount(0);
        await refreshUnreadCount();
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <ModalScreen
      scrollable={false}
      style={{
        paddingBottom: 10,
      }}>
      <ScreenHeader
        title="Notifications"
        subtitle="Updates about bookings and slots"
        isModal={true}
        modalVariant="compact"
        closeButtonPosition="right"
      />

      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <AppButton
          label="Read all"
          tone="secondary"
          onPress={onMarkAllRead}
          loading={
            actionLoading && pendingAction?.kind === 'mark-all-read'
          }
          disabled={items.length === 0}
        />
      </View>

      <View style={{ flex: 1, minHeight: 0 }}>
        <FlatList
          data={items}
          keyExtractor={item => item.notification_id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottomContentPadding,
            gap: 10,
          }}
          refreshing={loading}
          onRefresh={reload}
          ListEmptyComponent={
            loading ? null : (
              <EmptyState text="No notifications. You are all caught up." />
            )
          }
          renderItem={({ item }) => {
            const unread = isUnread(item);
            const isMarkReadPending =
              actionLoading &&
              pendingAction?.kind === 'mark-read' &&
              pendingAction.notificationId === item.notification_id;
            const isArchivePending =
              actionLoading &&
              pendingAction?.kind === 'archive' &&
              pendingAction.notificationId === item.notification_id;

            return (
              <Card
                style={{
                  borderColor: unread ? colors.primary : colors.border,
                }}>
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: colors.text,
                    }}>
                    {getNotificationTitle(item)}
                  </Text>
                  <Text style={{ color: colors.textSoft, fontSize: 14 }}>
                    {getNotificationBody(item)}
                  </Text>
                  <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : ''}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <AppButton
                    label={unread ? 'Mark read' : 'Read'}
                    tone="secondary"
                    onPress={() => onMarkRead(item.notification_id)}
                    loading={isMarkReadPending}
                    disabled={!unread || isMarkReadPending}
                    style={{ flex: 1 }}
                  />
                  <AppButton
                    label="Archive"
                    tone="surface"
                    onPress={() => onArchive(item.notification_id)}
                    loading={isArchivePending}
                    disabled={isArchivePending}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            );
          }}
        />
        <View
          pointerEvents="none"
          style={{
            height: bottomGuardHeight,
            backgroundColor: colors.surface,
          }}
        />
      </View>
    </ModalScreen>
  );
}
