import { ApiClient } from './client';
import type { components, operations } from './schema';

export type NotificationStatus = 'unread' | 'read' | 'archived' | string;
type ApiNotificationStatus =
  operations['get_notifications_me_notifications_get']['parameters']['query'] extends infer T
    ? T extends { status?: infer S }
      ? Exclude<S, null | undefined>
      : never
    : never;

export type NotificationListApiResponse =
  components['schemas']['NotificationListResponse'];
export type NotificationUnreadCountApiResponse =
  components['schemas']['UnreadCountResponse'];
export type OkResponse = components['schemas']['OkResponse'];
export type MarkAllReadResponse = components['schemas']['MarkAllReadResponse'];
export type ApiNotificationItem = components['schemas']['NotificationItem'];

export type NotificationItem = {
  notification_id: string;
  status?: NotificationStatus;
  type?: string;
  title?: string | null;
  body?: string | null;
  message?: string | null;
  created_at?: string;
  read_at?: string | null;
  archived_at?: string | null;
  payload?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  next_cursor?: string | null;
};

export type NotificationUnreadCountResponse = {
  unread_count: number;
};

function normalizeNotificationItem(raw: ApiNotificationItem): NotificationItem {
  const notificationId = raw.id;

  return {
    ...raw,
    status: raw.status as NotificationStatus,
    notification_id: notificationId,
  };
}

export async function getMyNotifications(
  api: ApiClient,
  params?: { status?: ApiNotificationStatus | null; limit?: number; cursor?: string | null },
): Promise<NotificationListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.cursor) qs.set('cursor', params.cursor);

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const data = await api.request<NotificationListApiResponse>(`/me/notifications${suffix}`, {
    method: 'GET',
  });

  return {
    items: data.items.map(normalizeNotificationItem),
    next_cursor: data.next_cursor ?? null,
  };
}

export async function getNotificationUnreadCount(
  api: ApiClient,
): Promise<NotificationUnreadCountResponse> {
  const data = await api.request<NotificationUnreadCountApiResponse>('/me/notifications/unread-count', {
    method: 'GET',
  });

  return {
    unread_count: data.count,
  };
}

export async function markNotificationRead(
  api: ApiClient,
  notificationId: string,
): Promise<OkResponse> {
  return api.request(`/me/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
  });
}

export async function markAllNotificationsRead(api: ApiClient): Promise<MarkAllReadResponse> {
  return api.request('/me/notifications/read-all', {
    method: 'POST',
  });
}

export async function archiveNotification(
  api: ApiClient,
  notificationId: string,
): Promise<OkResponse> {
  return api.request(`/me/notifications/${encodeURIComponent(notificationId)}/archive`, {
    method: 'POST',
  });
}

export function buildNotificationsStreamUrl(baseUrl: string, token: string) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const qs = new URLSearchParams({ access_token: token });
  return `${normalizedBase}/me/notifications/stream?${qs.toString()}`;
}