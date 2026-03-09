import type { components } from "./schema";
import { ApiClient } from "./client";

export type LoginBody = components["schemas"]["Login"];
export type RegisterBody = components["schemas"]["Register"];
export type TokenResponse = components["schemas"]["TokenResponse"];
export type MeResponse = components["schemas"]["MeResponse"];

export async function login(api: ApiClient, body: LoginBody): Promise<TokenResponse> {
  return api.request<TokenResponse>("/login", { method: "POST", json: body });
}

export async function register(api: ApiClient, body: RegisterBody): Promise<unknown> {
  return api.request("/register", { method: "POST", json: body });
}

export async function getMe(api: ApiClient): Promise<MeResponse> {
  return api.request<MeResponse>("/me", { method: "GET" });
}