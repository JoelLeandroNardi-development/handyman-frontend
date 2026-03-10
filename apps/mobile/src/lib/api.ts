import { createApiClient as createApiClientCore } from "@smart/api";
import type { TokenProvider } from "@smart/api";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8000";

const mobileTokenProvider: TokenProvider = async () => SecureStore.getItemAsync("token");

export function createApiClient() {
  return createApiClientCore(API_BASE_URL, mobileTokenProvider);
}
