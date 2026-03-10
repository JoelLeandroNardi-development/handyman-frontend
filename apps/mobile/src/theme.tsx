import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import * as SecureStore from "expo-secure-store";
import { palettes, type ThemeMode, type ThemePalette } from "@smart/theme";

const STORAGE_KEY = "handyman-theme-mode";

const fallbackMode: ThemeMode = "light";

function castMode(value: string | null): ThemeMode {
  if (value === "dark" || value === "light") return value;
  return fallbackMode;
}

async function loadStoredMode(): Promise<ThemeMode> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // ignore
  }
  return fallbackMode;
}

async function saveMode(mode: ThemeMode) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

function getPreferredMode(): ThemeMode {
  const appearance = Appearance.getColorScheme();
  if (appearance === "dark") return "dark";
  return "light";
}

function getThemeData(mode: ThemeMode): ThemePalette {
  return palettes[mode];
}

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemePalette;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(fallbackMode);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const stored = await loadStoredMode();
      const preferred = getPreferredMode();
      if (isMounted) {
        setModeState(stored || preferred);
      }
    })();

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setModeState((current) => {
        if (current === "light" || current === "dark") return current;
        return colorScheme === "dark" ? "dark" : "light";
      });
    });

    return () => {
      isMounted = false;
      listener.remove();
    };
  }, []);

  useEffect(() => {
    saveMode(mode);
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ mode, colors: getThemeData(mode), toggle, setMode }),
    [mode, toggle, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
