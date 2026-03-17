import { ApiClient } from './client';

export async function systemHealth(
  api: ApiClient,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/system/health', {
    method: 'GET',
  });
}

export async function systemRabbit(
  api: ApiClient,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/system/rabbit', {
    method: 'GET',
  });
}

export async function systemOutbox(
  api: ApiClient,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/system/outbox', {
    method: 'GET',
  });
}

export async function breakersStatus(
  api: ApiClient,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/system/breakers', {
    method: 'GET',
  });
}

export async function breakerOpen(
  api: ApiClient,
  name: string,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>(
    `/system/breakers/${encodeURIComponent(name)}/open`,
    { method: 'POST' },
  );
}

export async function breakerClose(
  api: ApiClient,
  name: string,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>(
    `/system/breakers/${encodeURIComponent(name)}/close`,
    { method: 'POST' },
  );
}
