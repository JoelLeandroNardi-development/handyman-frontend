import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  palettes,
  themes,
  type ThemeMode,
  type ThemePalette,
  type ThemeTokens,
} from '@smart/theme';

const STORAGE_KEY = 'handyman-theme-mode';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

async function loadStoredMode(): Promise<ThemeMode | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return isThemeMode(raw) ? raw : null;
  } catch {
    return null;
  }
}

async function saveMode(mode: ThemeMode) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {}
}

function getPreferredMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

function getThemeData(mode: ThemeMode): ThemePalette {
  return palettes[mode];
}

function getThemeTokens(mode: ThemeMode): ThemeTokens {
  return themes[mode];
}

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemePalette;
  tokens: ThemeTokens;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getPreferredMode);
  const [hasStoredPreference, setHasStoredPreference] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const stored = await loadStoredMode();
      if (!isMounted) return;

      if (stored) {
        setModeState(stored);
        setHasStoredPreference(true);
      } else {
        setModeState(getPreferredMode());
        setHasStoredPreference(false);
      }
    })();

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (!hasStoredPreference) {
        setModeState(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });

    return () => {
      isMounted = false;
      listener.remove();
    };
  }, [hasStoredPreference]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    setHasStoredPreference(true);
    void saveMode(nextMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState(prev => {
      const nextMode = prev === 'light' ? 'dark' : 'light';
      setHasStoredPreference(true);
      void saveMode(nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: getThemeData(mode),
      tokens: getThemeTokens(mode),
      toggle,
      setMode,
    }),
    [mode, toggle, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
