import { ApiClient } from "@smart/api";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8000";

export function createApiClient() {
  return new ApiClient(API_BASE_URL, async () => SecureStore.getItemAsync("token"));
}