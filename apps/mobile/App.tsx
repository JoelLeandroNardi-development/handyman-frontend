import "./polyfills";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/lib/queryClient";
import RootNavigator from "./src/navigation/RootNavigator";
import { SessionProvider } from "./src/auth/SessionProvider";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}