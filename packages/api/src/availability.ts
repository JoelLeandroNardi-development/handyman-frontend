import type { components } from "./schema";
import { ApiClient } from "./client";

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

export async function getAvailabilityByEmail(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/availability/${encodeURIComponent(email)}`, { method: "GET" });
}

export async function setAvailabilityByEmail(
  api: ApiClient,
  email: string,
  body: SetAvailability
): Promise<unknown> {
  return api.request(`/availability/${encodeURIComponent(email)}`, {
    method: "POST",
    json: body,
  });
}

export async function clearAvailabilityByEmail(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/availability/${encodeURIComponent(email)}`, { method: "DELETE" });
}

export async function adminListAvailability(
  api: ApiClient,
  params?: { limit?: number; cursor?: number }
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.cursor != null) qs.set("cursor", String(params.cursor));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request(`/availability${suffix}`, { method: "GET" });
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
  const qs = new URLSearchParams();

  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.cursor != null) qs.set("cursor", String(params.cursor));

  const suffix = qs.toString() ? `?${qs}` : "";

  return api.request(`/availability${suffix}`, {
    method: "GET",
  });
}