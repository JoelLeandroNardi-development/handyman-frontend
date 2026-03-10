import { ApiClient } from "./client";
import type { components } from "./schema";

export type HandymanResponse = components["schemas"]["HandymanResponse"];
export type UpdateHandyman = components["schemas"]["UpdateHandyman"];
export type CreateHandyman = components["schemas"]["CreateHandyman"];

export async function listHandymen(
  api: ApiClient,
  params?: { limit?: number; offset?: number }
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";

  return api.request(`/handymen${suffix}`, {
    method: "GET",
  });
}

export async function createHandyman(
  api: ApiClient,
  body: CreateHandyman
): Promise<unknown> {
  return api.request("/handymen", {
    method: "POST",
    json: body,
  });
}

export async function getHandyman(
  api: ApiClient,
  email: string
): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, {
    method: "GET",
  });
}

export async function updateHandyman(
  api: ApiClient,
  email: string,
  body: UpdateHandyman
): Promise<HandymanResponse> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, {
    method: "PUT",
    json: body,
  });
}

export async function deleteHandyman(
  api: ApiClient,
  email: string
): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function updateHandymanLocation(
  api: ApiClient,
  email: string,
  body: { latitude: number; longitude: number }
): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}/location`, {
    method: "PUT",
    json: body,
  });
}

export async function getMeHandyman(api: ApiClient): Promise<HandymanResponse> {
  return api.request("/me/handyman", {
    method: "GET",
  });
}

export async function updateMeHandyman(
  api: ApiClient,
  body: UpdateHandyman
): Promise<HandymanResponse> {
  return api.request("/me/handyman", {
    method: "PUT",
    json: body,
  });
}