import type { components } from "./schema";
import { ApiClient } from "./client";
import { buildQueryString } from "./utils/queryBuilder";

export type AvailabilitySlot = components["schemas"]["AvailabilitySlot"];
export type SetAvailability = components["schemas"]["SetAvailability"];

export async function getMyAvailability(api: ApiClient): Promise<unknown> {
  return api.request("/me/availability", { method: "GET" });
}

export async function setMyAvailability(api: ApiClient, body: SetAvailability): Promise<unknown> {
  return api.request("/me/availability", { method: "POST", json: body });
}

export async function clearMyAvailability(api: ApiClient): Promise<unknown> {
  return api.request("/me/availability", { method: "DELETE" });
}

export async function setAvailability(
  api: ApiClient,
  email: string,
  body: SetAvailability
): Promise<unknown> {
  return api.request(`/availability/${encodeURIComponent(email)}`, {
    method: "POST",
    json: body,
  });
}

export async function getAvailability(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/availability/${encodeURIComponent(email)}`, {
    method: "GET",
  });
}

export async function clearAvailability(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/availability/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function adminListAllAvailability(
  api: ApiClient,
  params?: { limit?: number; cursor?: number }
): Promise<unknown> {
  const suffix = buildQueryString(params || {});
  return api.request(`/availability${suffix}`, {
    method: "GET",
  });
}