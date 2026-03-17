import * as SecureStore from "expo-secure-store";
import type { MeResponse } from "@smart/api";

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROLE_MODE_KEY = "mobile_role_mode";

export type RoleMode = "user" | "handyman";

export type MobileSession = {
  token: string;
  me: MeResponse;
  email: string;
  roles: string[];
};

export type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export async function getStoredTokens(): Promise<StoredTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  return { accessToken, refreshToken };
}

export async function getStoredAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function storeTokenPair(accessToken: string, refreshToken?: string | null): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    refreshToken
      ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
      : SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function getStoredToken(): Promise<string | null> {
  return getStoredAccessToken();
}

export async function storeToken(token: string): Promise<void> {
  await storeTokenPair(token, null);
}

export async function clearToken(): Promise<void> {
  await clearTokens();
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