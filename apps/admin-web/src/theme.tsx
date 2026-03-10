import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { palettes, type ThemeMode, type ThemePalette } from "@smart/theme";

const THEME_KEY = "handyman-theme-mode";

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") return stored;

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function applyTheme(mode: ThemeMode) {
  const palette: ThemePalette = palettes[mode];

  const root = document.documentElement;
  root.dataset.theme = mode;

  Object.entries(palette).forEach(([key, color]) => {
    root.style.setProperty(`--${key}`, color);
  });
}

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
