import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { themes, type ThemeMode } from "@smart/theme";

const THEME_KEY = "handyman-theme-mode";

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function toCssVarName(key: string) {
  return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function applyTheme(mode: ThemeMode) {
  const theme = themes[mode];
  const root = document.documentElement;

  root.dataset.theme = mode;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${toCssVarName(key)}`, value);
  });

  Object.entries(theme.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${toCssVarName(key)}`, value);
  });

  Object.entries(theme.shadow).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${toCssVarName(key)}`, value);
  });

  root.style.setProperty("--control-height", theme.control.height);
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