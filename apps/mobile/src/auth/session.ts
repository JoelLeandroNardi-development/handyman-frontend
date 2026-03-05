import * as SecureStore from "expo-secure-store";
import { decodeJwt, type JwtClaims } from "@smart/core";

const TOKEN_KEY = "token";
const ROLE_MODE_KEY = "mobile_role_mode"; // "user" | "handyman"

export type RoleMode = "user" | "handyman";

export type MobileSession = {
  token: string;
  claims: JwtClaims;
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

export async function getSession(): Promise<MobileSession | null> {
  const token = await getStoredToken();
  if (!token) return null;

  try {
    const claims = decodeJwt(token);
    const roles = (claims.roles ?? []) as string[];
    return { token, claims, roles };
  } catch {
    return null;
  }
}

export function getMobileRoles(roles: string[]): RoleMode[] {
  const set = new Set(roles);
  const out: RoleMode[] = [];
  if (set.has("user")) out.push("user");
  if (set.has("handyman")) out.push("handyman");
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