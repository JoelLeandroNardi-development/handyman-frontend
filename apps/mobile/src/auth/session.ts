import * as SecureStore from "expo-secure-store";
import type { MeResponse } from "@smart/api";

const TOKEN_KEY = "token";
const ROLE_MODE_KEY = "mobile_role_mode";

export type RoleMode = "user" | "handyman";

export type MobileSession = {
  token: string;
  me: MeResponse;
  email: string;
  roles: string[];
};

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function buildSession(token: string, me: MeResponse): MobileSession {
  return {
    token,
    me,
    email: me.email,
    roles: me.roles ?? [],
  };
}

export function getMobileRoles(roles: string[]): RoleMode[] {
  const out: RoleMode[] = [];
  if (roles.includes("user")) out.push("user");
  if (roles.includes("handyman")) out.push("handyman");
  return out;
}

export async function getStoredRoleMode(): Promise<RoleMode | null> {
  const v = await SecureStore.getItemAsync(ROLE_MODE_KEY);
  if (v === "user" || v === "handyman") return v;
  return null;
}

export async function storeRoleMode(mode: RoleMode): Promise<void> {
  await SecureStore.setItemAsync(ROLE_MODE_KEY, mode);
}

export async function clearRoleMode(): Promise<void> {
  await SecureStore.deleteItemAsync(ROLE_MODE_KEY);
}