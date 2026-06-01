/**
 * Design System - Color Tokens
 * Minimalist, dark-first design with Electric Blue accent.
 * All colors are semantic tokens — reference by role, not value.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Surfaces
    background: "#FFFFFF",
    surface1: "#F8F8FA",
    surface2: "#F1F1F4",
    surface3: "#E8E8EC",

    // Borders
    border: "rgba(0, 0, 0, 0.06)",
    borderStrong: "rgba(0, 0, 0, 0.12)",

    // Text
    text: "#09090B",
    textPrimary: "#09090B",
    textSecondary: "#71717A",
    textTertiary: "#A1A1AA",

    // Accent
    tint: "#2563EB",
    accent: "#2563EB",
    accentSubtle: "rgba(37, 99, 235, 0.08)",

    // Semantic
    success: "#16A34A",
    successSubtle: "rgba(22, 163, 74, 0.08)",
    destructive: "#DC2626",
    destructiveSubtle: "rgba(220, 38, 38, 0.08)",
    warning: "#D97706",
    warningSubtle: "rgba(217, 119, 6, 0.08)",

    // Legacy compat
    icon: "#71717A",
    tabIconDefault: "#A1A1AA",
    tabIconSelected: "#2563EB",
  },
  dark: {
    // Surfaces
    background: "#0A0A0B",
    surface1: "#141416",
    surface2: "#1C1C1F",
    surface3: "#242428",

    // Borders
    border: "rgba(255, 255, 255, 0.06)",
    borderStrong: "rgba(255, 255, 255, 0.12)",

    // Text
    text: "#F5F5F7",
    textPrimary: "#F5F5F7",
    textSecondary: "#8E8E93",
    textTertiary: "#5A5A5E",

    // Accent
    tint: "#3B82F6",
    accent: "#3B82F6",
    accentSubtle: "rgba(59, 130, 246, 0.12)",

    // Semantic
    success: "#22C55E",
    successSubtle: "rgba(34, 197, 94, 0.12)",
    destructive: "#EF4444",
    destructiveSubtle: "rgba(239, 68, 68, 0.12)",
    warning: "#F59E0B",
    warningSubtle: "rgba(245, 158, 11, 0.12)",

    // Legacy compat
    icon: "#8E8E93",
    tabIconDefault: "#5A5A5E",
    tabIconSelected: "#3B82F6",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
