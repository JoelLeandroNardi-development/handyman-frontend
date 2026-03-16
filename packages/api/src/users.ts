import type { components } from "./schema";
import { ApiClient } from "./client";
import { buildQueryString } from "./utils/queryBuilder";

export type CreateUser = components["schemas"]["CreateUser"];
export type UpdateUser = components["schemas"]["UpdateUser"];
export type UpdateUserLocation = components["schemas"]["UpdateUserLocation"];
export type UserResponse = components["schemas"]["UserResponse"];

export async function createUser(api: ApiClient, body: CreateUser): Promise<unknown> {
  return api.request("/users", { method: "POST", json: body });
}

export async function adminListUsers(
  api: ApiClient,
  params?: { limit?: number; offset?: number }
): Promise<UserResponse[]> {
  const suffix = buildQueryString(params || {});
  return api.request<UserResponse[]>(`/users${suffix}`, { method: "GET" });
}

// Still untyped in OpenAPI right now
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

export async function updateMe(
  api: ApiClient,
  body: UpdateUser
): Promise<UserResponse> {
  return api.request<UserResponse>("/me", {
    method: "PUT",
    json: body,
  });
}

export async function getMeUser(api: ApiClient): Promise<UserResponse> {
  return api.request<UserResponse>("/me/user", { method: "GET" });
}