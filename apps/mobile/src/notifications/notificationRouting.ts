import type { NotificationItem } from '@smart/api';

export type NotificationTargetTab = 'Bookings' | 'Jobs';

export type NotificationNavigationTarget = {
  tab: NotificationTargetTab;
  bookingId: string;
};

type AnyRecord = Record<string, unknown>;

const USER_NOTIFICATION_TYPES = new Set([
  'booking.reserved',
  'booking.confirmed',
  'booking.rejected',
  'booking.rejected_by_handyman',
  'booking.expired',
  'booking.cancelled',
  'booking.completed',
  'booking.completion_requested',
  'review.request',
  'review.requested',
  'review.reminder',
  'booking.review_requested',
]);

const HANDYMAN_NOTIFICATION_TYPES = new Set([
  'job.requested',
  'job.confirmed',
  'job.released',
  'job.completed',
  'job.completion_requested',
]);

export function normalizeNotificationType(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (normalized.length === 0) return normalized;

  if (normalized.includes('.')) return normalized;
  if (normalized.startsWith('booking_')) {
    return `booking.${normalized.slice('booking_'.length)}`;
  }
  if (normalized.startsWith('job_')) {
    return `job.${normalized.slice('job_'.length)}`;
  }
  if (normalized.startsWith('review_')) {
    return `review.${normalized.slice('review_'.length)}`;
  }

  return normalized;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getPayload(item: NotificationItem): AnyRecord {
  if (item.payload && typeof item.payload === 'object') {
    return item.payload as AnyRecord;
  }
  return {};
}

function extractBookingId(item: NotificationItem): string | null {
  const payload = getPayload(item);

  return (
    asNonEmptyString(payload.booking_id) ??
    asNonEmptyString(item.entity_id) ??
    asNonEmptyString(item.booking_id)
  );
}

function inferTabFromActionUrl(actionUrl: string | null): NotificationTargetTab | null {
  if (!actionUrl) return null;

  const normalized = actionUrl.toLowerCase();
  if (normalized.startsWith('/bookings/')) return 'Bookings';
  if (normalized.startsWith('/jobs/')) return 'Jobs';
  return null;
}

function inferTabFromType(type: string | null): NotificationTargetTab | null {
  if (!type) return null;

  const normalizedType = normalizeNotificationType(type);

  if (USER_NOTIFICATION_TYPES.has(normalizedType)) return 'Bookings';
  if (HANDYMAN_NOTIFICATION_TYPES.has(normalizedType)) return 'Jobs';

  if (normalizedType.startsWith('booking.') || normalizedType.startsWith('review.')) {
    return 'Bookings';
  }
  if (normalizedType.startsWith('job.')) {
    return 'Jobs';
  }
  return null;
}

export function getNotificationNavigationTarget(
  item: NotificationItem,
): NotificationNavigationTarget | null {
  const bookingId = extractBookingId(item);
  if (!bookingId) return null;

  const actionUrl = asNonEmptyString(item.action_url);
  const type = asNonEmptyString(item.type);

  const tab =
    inferTabFromActionUrl(actionUrl) ??
    inferTabFromType(type) ??
    (item.entity_type === 'booking' ? 'Bookings' : null);

  if (!tab) return null;

  return {
    tab,
    bookingId,
  };
}
