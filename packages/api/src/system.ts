import { ApiClient } from "./client";

export async function systemHealth(api: ApiClient): Promise<unknown> {
  return api.request("/system/health", { method: "GET" });
}

export async function systemRabbit(api: ApiClient): Promise<unknown> {
  return api.request("/system/rabbit", { method: "GET" });
}

export async function systemOutbox(api: ApiClient): Promise<unknown> {
  return api.request("/system/outbox", { method: "GET" });
}

export async function breakersStatus(api: ApiClient): Promise<unknown> {
  return api.request("/system/breakers", { method: "GET" });
}

export async function breakerOpen(api: ApiClient, name: string): Promise<unknown> {
  return api.request(`/system/breakers/${encodeURIComponent(name)}/open`, { method: "POST" });
}

export async function breakerClose(api: ApiClient, name: string): Promise<unknown> {
  return api.request(`/system/breakers/${encodeURIComponent(name)}/close`, { method: "POST" });
}