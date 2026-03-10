import { QueryClient } from "@tanstack/react-query";

export const queryClientOptions = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
};

export function createQueryClient() {
  return new QueryClient(queryClientOptions);
}
