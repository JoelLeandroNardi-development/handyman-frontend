import { createApiClient as createApiClientCore } from "@smart/api";
import type { TokenProvider } from "@smart/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function createApiClient(getToken: TokenProvider) {
  return createApiClientCore(API_BASE_URL, getToken);
}
