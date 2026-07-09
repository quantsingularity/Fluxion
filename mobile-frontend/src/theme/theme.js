import { MD3DarkTheme } from "react-native-paper";

// Design tokens shared across the mobile app. These mirror the web frontend's
// Chakra theme so both clients present a single, consistent Fluxion identity:
// a dark surface with a brand-blue to accent-orange gradient language.
export const colors = {
  // Brand (blue)
  brand: {
    50: "#e6f7ff",
    100: "#b3e0ff",
    200: "#80caff",
    300: "#4db3ff",
    400: "#1a9dff",
    500: "#0080ff",
    600: "#0066cc",
    700: "#004d99",
    800: "#003366",
    900: "#001a33",
  },
  // Accent (orange)
  accent: {
    300: "#ffa34d",
    400: "#ff8a1a",
    500: "#ff7000",
    600: "#cc5a00",
  },
  // Neutrals
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#0d1117",
  },
  // Semantic
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#eab308",
  purple: "#a855f7",

  // Surfaces
  background: "#0d1117",
  surface: "#161b22",
  card: "#1f2937",
  border: "#374151",

  // Text
  text: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const gradients = {
  brand: ["#0080ff", "#ff7000"],
  brandSoft: ["#1a9dff", "#ff8a1a"],
  surface: ["#111827", "#0d1117"],
};

// react-native-paper MD3 theme configured with the Fluxion palette.
export const paperTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.brand[500],
    onPrimary: colors.text,
    primaryContainer: colors.brand[800],
    onPrimaryContainer: colors.brand[100],
    secondary: colors.accent[500],
    onSecondary: colors.text,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.card,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.danger,
    elevation: {
      level0: "transparent",
      level1: colors.surface,
      level2: colors.card,
      level3: colors.card,
      level4: colors.card,
      level5: colors.card,
    },
  },
};

export default paperTheme;
