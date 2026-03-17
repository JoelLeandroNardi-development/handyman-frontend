import "./polyfills";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "./src/lib/queryClient";
import RootNavigator from "./src/navigation/RootNavigator";
import { SessionProvider } from "./src/auth/SessionProvider";
import { ThemeProvider } from "./src/theme";
import { NotificationsProvider } from "./src/notifications/NotificationsProvider";
import { AppLocationProvider } from "./src/location/AppLocationProvider";

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppLocationProvider>
            <SessionProvider>
              <NotificationsProvider>
                <RootNavigator />
              </NotificationsProvider>
            </SessionProvider>
          </AppLocationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}