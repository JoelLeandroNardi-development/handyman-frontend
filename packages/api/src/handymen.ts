import type { components } from "./schema";
import { ApiClient } from "./client";

export type CreateHandyman = components["schemas"]["CreateHandyman"];
export type UpdateHandyman = components["schemas"]["UpdateHandyman"];
export type UpdateHandymanLocation = components["schemas"]["UpdateHandymanLocation"];
export type HandymanResponse = components["schemas"]["HandymanResponse"];

export async function listHandymen(
  api: ApiClient,
  params?: { limit?: number; offset?: number }
): Promise<HandymanResponse[]> {
  const qs = new URLSearchParams();

  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));

  const suffix = qs.toString() ? `?${qs}` : "";

  return api.request<HandymanResponse[]>(`/handymen${suffix}`, {
    method: "GET",
  });
}

export async function createHandyman(api: ApiClient, body: CreateHandyman): Promise<unknown> {
  return api.request("/handymen", {
    method: "POST",
    json: body,
  });
}

// Still effectively untyped in some gateway versions
export async function getHandyman(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, {
    method: "GET",
  });
}

export async function adminUpdateHandyman(
  api: ApiClient,
  email: string,
  body: UpdateHandyman
): Promise<HandymanResponse> {
  return api.request<HandymanResponse>(`/handymen/${encodeURIComponent(email)}`, {
    method: "PUT",
    json: body,
  });
}

export async function adminDeleteHandyman(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function updateHandymanLocation(
  api: ApiClient,
  email: string,
  body: UpdateHandymanLocation
): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}/location`, {
    method: "PUT",
    json: body,
  });
}

export async function getMeHandyman(api: ApiClient): Promise<HandymanResponse> {
  return api.request<HandymanResponse>("/me/handyman", {
    method: "GET",
  });
}

export async function updateMeHandyman(
  api: ApiClient,
  body: UpdateHandyman
): Promise<HandymanResponse> {
  return api.request<HandymanResponse>("/me/handyman", {
    method: "PUT",
    json: body,
  });
}