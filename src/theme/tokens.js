import { Platform } from "react-native";

/** Design tokens — spacing, radii, typography, motion */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const typography = {
  hero: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: "700", letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: "700", letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 16, fontWeight: "400" },
  bodyMedium: { fontSize: 16, fontWeight: "500" },
  caption: { fontSize: 13, fontWeight: "500" },
  micro: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
  label: { fontSize: 14, fontWeight: "600" },
};

export const layout = {
  screenPadding: Platform.OS === "android" ? 16 : 20,
  cardPadding: Platform.OS === "android" ? 12 : 16,
  headerHeight: 56,
  tabBarHeight: Platform.OS === "android" ? 56 : 64,
};

/** Scroll content padding when a footer tab bar is visible */
export function footerScrollPadding(bottomInset = 0) {
  return layout.tabBarHeight + bottomInset + spacing.sm;
}

export const brand = {
  light: {
    primary: "#4F46E5",
    primaryDark: "#3730A3",
    primaryMuted: "#EEF2FF",
    accent: "#0D9488",
    accentMuted: "#CCFBF1",
    coral: "#F97316",
    background: "#F1F5F9",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
    white: "#FFFFFF",
    overlay: "rgba(15, 23, 42, 0.45)",
    gradient: ["#4F46E5", "#6366F1", "#818CF8"],
    tabBar: "#FFFFFF",
    tabBarActive: "#4F46E5",
    tabBarInactive: "#94A3B8",
  },
  dark: {
    primary: "#818CF8",
    primaryDark: "#6366F1",
    primaryMuted: "#312E81",
    accent: "#2DD4BF",
    accentMuted: "#134E4A",
    coral: "#FB923C",
    background: "#0B1120",
    surface: "#151D2E",
    surfaceElevated: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    border: "#334155",
    borderLight: "#1E293B",
    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    info: "#60A5FA",
    white: "#FFFFFF",
    overlay: "rgba(0, 0, 0, 0.65)",
    gradient: ["#3730A3", "#4F46E5", "#6366F1"],
    tabBar: "#151D2E",
    tabBarActive: "#818CF8",
    tabBarInactive: "#64748B",
  },
};
