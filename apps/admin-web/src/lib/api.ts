import { ApiClient } from "@smart/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function createApiClient(getToken: () => string | null) {
  return new ApiClient(API_BASE_URL, getToken);
}

export { API_BASE_URL };