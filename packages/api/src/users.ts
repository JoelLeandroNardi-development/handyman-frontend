import type { components } from "./schema";
import { ApiClient } from "./client";

export type CreateUser = components["schemas"]["CreateUser"];
export type UpdateUser = components["schemas"]["UpdateUser"];
export type UpdateUserLocation = components["schemas"]["UpdateUserLocation"];
export type UserResponse = components["schemas"]["UserResponse"];

export async function createUser(api: ApiClient, body: CreateUser): Promise<unknown> {
  return api.request("/users", { method: "POST", json: body });
}

// Admin list users returns array of UserResponse
export async function adminListUsers(api: ApiClient, params?: { limit?: number; offset?: number }): Promise<UserResponse[]> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request<UserResponse[]>(`/users${suffix}`, { method: "GET" });
}

// GET /users/{email} response is `{}` in OpenAPI right now; keeping unknown until you fix schema
export async function getUser(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/users/${encodeURIComponent(email)}`, { method: "GET" });
}

export async function adminUpdateUser(api: ApiClient, email: string, body: UpdateUser): Promise<UserResponse> {
  return api.request<UserResponse>(`/users/${encodeURIComponent(email)}`, { method: "PUT", json: body });
}

export async function adminDeleteUser(api: ApiClient, email: string): Promise<unknown> {
  return api.request(`/users/${encodeURIComponent(email)}`, { method: "DELETE" });
}

export async function updateUserLocation(api: ApiClient, email: string, body: UpdateUserLocation): Promise<unknown> {
  return api.request(`/users/${encodeURIComponent(email)}/location`, { method: "PUT", json: body });
}