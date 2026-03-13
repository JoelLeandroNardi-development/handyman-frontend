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

export type ThemeTokens = {
  colors: ThemePalette;
  radius: {
    sm: string;
    md: string;
    lg: string;
    pill: string;
  };
  shadow: {
    sm: string;
    md: string;
  };
  control: {
    height: string;
  };
};

const shared = {
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    pill: "999px",
  },
  control: {
    height: "44px",
  },
} satisfies Omit<ThemeTokens, "colors" | "shadow">;

export const lightPalette: ThemePalette = {
  bg: "#f3f5f9",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  text: "#0f172a",
  textSoft: "#475569",
  textFaint: "#64748b",
  primary: "#2563eb",
  primarySoft: "#dbeafe",
  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#fef3c7",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
};

export const darkPalette: ThemePalette = {
  bg: "#081224",
  surface: "#0d1a2f",
  surfaceMuted: "#12233d",
  border: "#233653",
  borderStrong: "#34507a",
  text: "#f8fafc",
  textSoft: "#d7e3f4",
  textFaint: "#9fb2cf",
  primary: "#fb7a21",
  primarySoft: "rgba(251, 122, 33, 0.18)",
  success: "#22c55e",
  successSoft: "rgba(34, 197, 94, 0.18)",
  warning: "#f59e0b",
  warningSoft: "rgba(245, 158, 11, 0.18)",
  danger: "#ef4444",
  dangerSoft: "rgba(239, 68, 68, 0.18)",
};

export const themes: Record<ThemeMode, ThemeTokens> = {
  light: {
    colors: lightPalette,
    shadow: {
      sm: "0 1px 2px rgba(15, 23, 42, 0.04)",
      md: "0 10px 30px rgba(15, 23, 42, 0.08)",
    },
    ...shared,
  },
  dark: {
    colors: darkPalette,
    shadow: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.25)",
      md: "0 14px 38px rgba(0, 0, 0, 0.34)",
    },
    ...shared,
  },
};

export const palettes: Record<ThemeMode, ThemePalette> = {
  light: lightPalette,
  dark: darkPalette,
};