import { useMemo, useState, useCallback } from "react";
import { createApiClient as createApiClientCore } from "@smart/api";
import type { TokenProvider } from "@smart/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function createApiClient(getToken: TokenProvider) {
  return createApiClientCore(API_BASE_URL, getToken);
}

export function useAdminApiClient() {
  return useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
}

export function useActionBusy() {
  const [action, setAction] = useState("");

  const run = useCallback(async (name: string, operation: () => Promise<void>) => {
    setAction(name);
    try {
      await operation();
    } finally {
      setAction("");
    }
  }, []);

  return {
    action,
    busy: action !== "",
    is: (name: string) => action === name,
    run,
  };
}
