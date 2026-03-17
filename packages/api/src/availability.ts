import { ApiClient } from './client';
import type { components } from './schema';
import { buildQueryString } from './utils/queryBuilder';

export type AvailabilitySlot = components['schemas']['AvailabilitySlot'];
export type SetAvailability = components['schemas']['SetAvailability'];

export async function getMyAvailability(
  api: ApiClient,
): Promise<AvailabilitySlot[]> {
  return api.request<AvailabilitySlot[]>('/me/availability', { method: 'GET' });
}

export async function setMyAvailability(
  api: ApiClient,
  body: SetAvailability,
): Promise<AvailabilitySlot> {
  return api.request<AvailabilitySlot>('/me/availability', {
    method: 'POST',
    json: body,
  });
}

export async function clearMyAvailability(api: ApiClient): Promise<void> {
  await api.request('/me/availability', { method: 'DELETE' });
}

export async function setAvailability(
  api: ApiClient,
  email: string,
  body: SetAvailability,
): Promise<AvailabilitySlot> {
  return api.request<AvailabilitySlot>(
    `/availability/${encodeURIComponent(email)}`,
    {
      method: 'POST',
      json: body,
    },
  );
}

export async function getAvailability(
  api: ApiClient,
  email: string,
): Promise<AvailabilitySlot[]> {
  return api.request<AvailabilitySlot[]>(
    `/availability/${encodeURIComponent(email)}`,
    {
      method: 'GET',
    },
  );
}

export async function clearAvailability(
  api: ApiClient,
  email: string,
): Promise<void> {
  await api.request(`/availability/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}

export async function adminListAllAvailability(
  api: ApiClient,
  params?: { limit?: number; cursor?: number },
): Promise<AvailabilitySlot[]> {
  const suffix = buildQueryString(params || {});
  return api.request<AvailabilitySlot[]>(`/availability${suffix}`, {
    method: 'GET',
  });
}
