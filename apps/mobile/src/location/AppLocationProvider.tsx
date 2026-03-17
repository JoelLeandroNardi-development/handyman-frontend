import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";

export type AppCoords = { latitude: number; longitude: number };

type AppLocationContextValue = {
  coords: AppCoords | null;
  loading: boolean;
  refreshLocation: () => Promise<void>;
  setCoords: (coords: AppCoords) => void;
};

const AppLocationContext = createContext<AppLocationContextValue | null>(null);

export function AppLocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoordsState] = useState<AppCoords | null>(null);
  const [loading, setLoading] = useState(false);

  const setCoords = useCallback((next: AppCoords) => {
    setCoordsState(next);
  }, []);

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoordsState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  const value = useMemo<AppLocationContextValue>(
    () => ({ coords, loading, refreshLocation, setCoords }),
    [coords, loading, refreshLocation, setCoords]
  );

  return <AppLocationContext.Provider value={value}>{children}</AppLocationContext.Provider>;
}

export function useAppLocation() {
  const ctx = useContext(AppLocationContext);
  if (!ctx) {
    throw new Error("useAppLocation must be used within AppLocationProvider");
  }
  return ctx;
}
