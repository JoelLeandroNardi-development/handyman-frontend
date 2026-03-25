import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  archiveNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '@smart/api';
import { useApi } from '../lib/ApiProvider';
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
  const api = useApi();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { roleMode, availableRoles, pickRole } = useSession();
  const {
    items,
    loadingItems,
    refreshItems,
    refreshUnreadCount,
    applyMarkRead,
    applyArchive,
    applyMarkAllRead,
  } = useNotifications();
  const [pendingAction, setPendingAction] =
    useState<PendingNotificationAction>(null);
  const pendingNavRef = useRef<NotificationNavigationTarget | null>(null);
  const { bottomGuardHeight, bottomContentPadding } = useBottomGuard();

  const { execute: runAction, loading: actionLoading } = useAsyncOperation({
    alertTitle: 'Notifications',
  });

  useEffect(() => {
    if (!isFocused) return;

    const pollTimer = setInterval(() => {
      void refreshItems();
    }, 30000);

    return () => clearInterval(pollTimer);
  }, [isFocused, refreshItems]);

  const reload = () => {
    void refreshItems();
  };

  const onMarkRead = (notificationId: string) => {
    if (actionLoading) {
      return;
    }

    setPendingAction({ kind: 'mark-read', notificationId });
    runAction(async () => {
      try {
        await markNotificationRead(api, notificationId);
        applyMarkRead(notificationId);
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
        applyArchive(notificationId);
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
        applyMarkAllRead();
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

    pendingNavRef.current = null;
    navigation.navigate('UserTabs', {
      screen: pending.tab,
      params: {
        focusBookingId: pending.bookingId,
        focusNonce: Date.now(),
      },
    });
  }, [roleMode, navigation]);

  const navigateToTarget = (target: NotificationNavigationTarget) => {
    if (target.targetRole === roleMode) {
      navigation.navigate('UserTabs', {
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
        applyMarkRead(item.notification_id);
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
          refreshing={loadingItems}
          onRefresh={reload}
          ListEmptyComponent={
            loadingItems ? null : (
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

