import type { components } from "./schema";
import { ApiClient } from "./client";

export type CreateHandyman = components["schemas"]["CreateHandyman"];
export type UpdateHandyman = components["schemas"]["UpdateHandyman"];
export type UpdateHandymanLocation = components["schemas"]["UpdateHandymanLocation"];
export type HandymanResponse = components["schemas"]["HandymanResponse"];

export async function createHandyman(api: ApiClient, body: CreateHandyman): Promise<unknown> {
  return api.request("/handymen", { method: "POST", json: body });
}

// GET /handymen list response is `{}` in OpenAPI right now; keep unknown for now
export async function listHandymen(
  api: ApiClient,
  params?: { limit?: number; offset?: number }
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request(`/handymen${suffix}`, { method: "GET" });
}

// GET /handymen/{email} response is `{}` in OpenAPI right now; keep unknown
export async function getHandyman(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, { method: "GET" });
}

export async function adminUpdateHandyman(api: ApiClient, email: string, body: UpdateHandyman): Promise<HandymanResponse> {
  return api.request<HandymanResponse>(`/handymen/${encodeURIComponent(email)}`, { method: "PUT", json: body });
}

export async function adminDeleteHandyman(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, { method: "DELETE" });
}

export async function updateHandymanLocation(api: ApiClient, email: string, body: UpdateHandymanLocation): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}/location`, { method: "PUT", json: body });
}