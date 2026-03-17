import { createApiClient as createApiClientCore, refresh as refreshTokens } from "@smart/api";
import type { TokenProvider } from "@smart/api";
import {
  clearTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeTokenPair,
} from "../auth/session";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8000";

const mobileTokenProvider: TokenProvider = async () => getStoredAccessToken();

export function createApiClient() {
  return createApiClientCore(API_BASE_URL, mobileTokenProvider, async () => {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
      const noAuthClient = createApiClientCore(API_BASE_URL, async () => null);
      const next = await refreshTokens(noAuthClient, { refresh_token: refreshToken });
      if (!next.access_token) return null;

      await storeTokenPair(next.access_token, next.refresh_token);

      return {
        accessToken: next.access_token,
        refreshToken: next.refresh_token,
      };
    } catch {
      await clearTokens();
      return null;
    }
  });
}
