export type ThemeMode = "light" | "dark";

export type ThemePalette = {
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textSoft: string;
  textFaint: string;
  primary: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
};

export const lightPalette: ThemePalette = {
  bg: "#f3f5f9",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  text: "#0f172a",
  textSoft: "#475569",
  textFaint: "#64748b",
  primary: "#2563eb", // blue
  primarySoft: "#dbeafe",
  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#fef3c7",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
};

export const darkPalette: ThemePalette = {
  bg: "#0f172a",
  surface: "#111827",
  surfaceMuted: "#1f2937",
  border: "#334155",
  borderStrong: "#475569",
  text: "#f8fafc",
  textSoft: "#e2e8f0",
  textFaint: "#cbd5e1",
  primary: "#f97316", // orange
  primarySoft: "#fed7aa",
  success: "#4ade80",
  successSoft: "#dcfce7",
  warning: "#f59e0b",
  warningSoft: "#fef3c7",
  danger: "#f87171",
  dangerSoft: "#fecaca",
};

export const palettes: Record<ThemeMode, ThemePalette> = {
  light: lightPalette,
  dark: darkPalette,
};
