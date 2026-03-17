export type ThemeMode = 'light' | 'dark';

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

export type Spacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type Typography = {
  display: { size: number; lineHeight: number; weight: string };
  heading: { size: number; lineHeight: number; weight: string };
  title: { size: number; lineHeight: number; weight: string };
  subtitle: { size: number; lineHeight: number; weight: string };
  body: { size: number; lineHeight: number; weight: string };
  bodySmall: { size: number; lineHeight: number; weight: string };
  label: { size: number; lineHeight: number; weight: string };
  labelSmall: { size: number; lineHeight: number; weight: string };
};

export type NativeRadius = {
  none: number;
  sm: number;
  md: number;
  lg: number;
  pill: number;
};

export type NativeShadow = {
  sm: {
    elevation: number;
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  md: {
    elevation: number;
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  lg: {
    elevation: number;
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
};

export type Sizing = {
  icon: number;
  iconLarge: number;
  touchTarget: number;
  lineHeight: number;
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
  spacing: Spacing;
  typography: Typography;
  nativeRadius: NativeRadius;
  nativeShadow: NativeShadow;
  sizing: Sizing;
};

const shared = {
  radius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
    pill: '999px',
  },
  control: {
    height: '44px',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    display: { size: 28, lineHeight: 34, weight: '800' },
    heading: { size: 24, lineHeight: 30, weight: '800' },
    title: { size: 18, lineHeight: 24, weight: '800' },
    subtitle: { size: 16, lineHeight: 22, weight: '700' },
    body: { size: 14, lineHeight: 20, weight: '400' },
    bodySmall: { size: 13, lineHeight: 18, weight: '400' },
    label: { size: 14, lineHeight: 18, weight: '700' },
    labelSmall: { size: 12, lineHeight: 16, weight: '700' },
  },
  nativeRadius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  },
  sizing: {
    icon: 20,
    iconLarge: 24,
    touchTarget: 44,
    lineHeight: 24,
  },
} satisfies Omit<ThemeTokens, 'colors' | 'shadow' | 'nativeShadow'>;

export const lightPalette: ThemePalette = {
  bg: '#f3f5f9',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textSoft: '#475569',
  textFaint: '#64748b',
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#d97706',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
};

export const darkPalette: ThemePalette = {
  bg: '#081224',
  surface: '#0d1a2f',
  surfaceMuted: '#12233d',
  border: '#233653',
  borderStrong: '#34507a',
  text: '#f8fafc',
  textSoft: '#d7e3f4',
  textFaint: '#9fb2cf',
  primary: '#fb7a21',
  primarySoft: 'rgba(251, 122, 33, 0.18)',
  success: '#22c55e',
  successSoft: 'rgba(34, 197, 94, 0.18)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245, 158, 11, 0.18)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239, 68, 68, 0.18)',
};

export const themes: Record<ThemeMode, ThemeTokens> = {
  light: {
    colors: lightPalette,
    shadow: {
      sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
      md: '0 10px 30px rgba(15, 23, 42, 0.08)',
    },
    nativeShadow: {
      sm: {
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      md: {
        elevation: 5,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      lg: {
        elevation: 10,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    },
    ...shared,
  },
  dark: {
    colors: darkPalette,
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
      md: '0 14px 38px rgba(0, 0, 0, 0.34)',
    },
    nativeShadow: {
      sm: {
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      md: {
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      lg: {
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
    },
    ...shared,
  },
};

export const palettes: Record<ThemeMode, ThemePalette> = {
  light: lightPalette,
  dark: darkPalette,
};
