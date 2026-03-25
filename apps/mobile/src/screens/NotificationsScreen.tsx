import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
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
import { useSession } from '../auth/SessionProvider';
import { useNotifications } from '../notifications/NotificationsProvider';
import {
  getNotificationNavigationTarget,
  type NotificationNavigationTarget,
} from '../notifications/notificationRouting';
import { AppButton, EmptyState } from '../ui/primitives';
import { ModalScreen } from '../ui/ModalScreen';
import { ScreenHeader } from '../ui/ScreenHeader';
import { NotificationCard, isUnread } from './NotificationCard';

type PendingNotificationAction =
  | { kind: 'mark-all-read' }
  | { kind: 'mark-read'; notificationId: string }
  | { kind: 'archive'; notificationId: string }
  | null;

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { roleMode, availableRoles, pickRole } = useSession();
  const { setUnreadCount, refreshUnreadCount, latestCreatedNotification } =
    useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pendingAction, setPendingAction] =
    useState<PendingNotificationAction>(null);
  const pendingNavRef = useRef<NotificationNavigationTarget | null>(null);
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

  useEffect(() => {
    const pending = pendingNavRef.current;
    if (!pending) return;
    if (pending.targetRole !== roleMode) return;

    const tabsScreenName = roleMode === 'handyman' ? 'HandymanTabs' : 'UserTabs';
    pendingNavRef.current = null;
    navigation.navigate(tabsScreenName, {
      screen: pending.tab,
      params: {
        focusBookingId: pending.bookingId,
        focusNonce: Date.now(),
      },
    });
  }, [roleMode, navigation]);

  const navigateToTarget = (target: NotificationNavigationTarget) => {
    if (target.targetRole === roleMode) {
      const tabsScreenName = roleMode === 'handyman' ? 'HandymanTabs' : 'UserTabs';
      navigation.navigate(tabsScreenName, {
        screen: target.tab,
        params: {
          focusBookingId: target.bookingId,
          focusNonce: Date.now(),
        },
      });
      return;
    }

    if (availableRoles.includes(target.targetRole as typeof availableRoles[number])) {
      pendingNavRef.current = target;
      pickRole(target.targetRole as typeof availableRoles[number]);
      return;
    }
  };

  const onOpenDetails = (item: NotificationItem) => {
    if (actionLoading) {
      return;
    }

    const target = getNotificationNavigationTarget(item);
    if (!target) {
      return;
    }

    runAction(async () => {
      if (isUnread(item)) {
        await markNotificationRead(api, item.notification_id);
        setItems(prev =>
          prev.map(current =>
            current.notification_id === item.notification_id
              ? {
                  ...current,
                  status: 'read',
                }
              : current,
          ),
        );
        await refreshUnreadCount();
      }

      navigateToTarget(target);
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
            const isMarkReadPending =
              actionLoading &&
              pendingAction?.kind === 'mark-read' &&
              pendingAction.notificationId === item.notification_id;
            const isArchivePending =
              actionLoading &&
              pendingAction?.kind === 'archive' &&
              pendingAction.notificationId === item.notification_id;

            return (
              <NotificationCard
                item={item}
                actionLoading={actionLoading}
                isMarkReadPending={isMarkReadPending}
                isArchivePending={isArchivePending}
                canOpenDetails={!!getNotificationNavigationTarget(item)}
                onMarkRead={() => onMarkRead(item.notification_id)}
                onOpenDetails={() => onOpenDetails(item)}
                onArchive={() => onArchive(item.notification_id)}
              />
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
