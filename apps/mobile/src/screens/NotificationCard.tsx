import React from 'react';
import { Text, View } from 'react-native';
import { type NotificationItem } from '@smart/api';
import { NOTIFICATION_EVENT_LABELS } from '@smart/core';
import { normalizeNotificationType } from '../notifications/notificationRouting';
import { useTheme } from '../theme';
import { AppButton, Card } from '../ui/primitives';

export function isUnread(item: NotificationItem) {
  return item.status === 'unread';
}

function getNotificationTitle(item: NotificationItem) {
  if (typeof item.title === 'string' && item.title.trim().length > 0)
    return item.title;
  if (typeof item.type === 'string' && item.type.trim().length > 0) {
    const rawType = item.type.trim().toLowerCase();
    const normalizedType = normalizeNotificationType(rawType);
    return (
      NOTIFICATION_EVENT_LABELS[
        rawType as keyof typeof NOTIFICATION_EVENT_LABELS
      ] ??
      NOTIFICATION_EVENT_LABELS[
        normalizedType as keyof typeof NOTIFICATION_EVENT_LABELS
      ] ??
      item.type
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

interface NotificationCardProps {
  item: NotificationItem;
  actionLoading: boolean;
  isMarkReadPending: boolean;
  isArchivePending: boolean;
  canOpenDetails: boolean;
  onMarkRead: () => void;
  onOpenDetails: () => void;
  onArchive: () => void;
}

export function NotificationCard({
  item,
  actionLoading,
  isMarkReadPending,
  isArchivePending,
  canOpenDetails,
  onMarkRead,
  onOpenDetails,
  onArchive,
}: NotificationCardProps) {
  const { colors } = useTheme();
  const unread = isUnread(item);

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
          onPress={onMarkRead}
          loading={isMarkReadPending}
          disabled={!unread || isMarkReadPending}
          style={{ flex: 1 }}
        />
        <AppButton
          label="Open details"
          tone="primary"
          onPress={onOpenDetails}
          disabled={!canOpenDetails || actionLoading}
          style={{ flex: 1 }}
        />
        <AppButton
          label="Archive"
          tone="surface"
          onPress={onArchive}
          loading={isArchivePending}
          disabled={isArchivePending}
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );
}
