// Heatmap color themes + foreground-contrast helpers for the time range selector.

/** Heatmap color theme key. */
export type HeatmapColorTheme = "slate" | "blue" | "emerald" | "violet" | "amber" | "rose";

/** A pair of light/dark palettes for heatmap rendering. */
export interface HeatmapPalette {
  light: string[];
  dark: string[];
  /** Accent color for selection markers, contrasting with the heatmap palette. */
  accent: { light: string; dark: string };
}

/** Built-in heatmap color themes. All use muted/desaturated tones to avoid conflicting with alert colors. */
export const HEATMAP_THEMES: Record<HeatmapColorTheme, HeatmapPalette> = {
  slate: {
    light: ["#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#1e293b"],
    dark:  ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#e2e8f0"],
    accent: { light: "#3b82f6", dark: "#60a5fa" },
  },
  blue: {
    light: ["#f0f7ff", "#c7ddf5", "#8fbce6", "#5a9bd5", "#3578b8", "#1a4e80"],
    dark:  ["#0f1e2e", "#1a3350", "#265078", "#3578b8", "#5a9bd5", "#a8cce8"],
    accent: { light: "#e85d04", dark: "#fb923c" },
  },
  emerald: {
    light: ["#f0fdf6", "#bbf0d4", "#6dd8a6", "#34b578", "#1f8c5a", "#0f5736"],
    dark:  ["#0a1f14", "#0f3524", "#1a5038", "#2b7a56", "#47b07a", "#94dbb5"],
    accent: { light: "#6366f1", dark: "#a5b4fc" },
  },
  violet: {
    light: ["#f5f3ff", "#d4ccf0", "#a896df", "#7e6bc7", "#5b44a8", "#3a2570"],
    dark:  ["#1a1030", "#2a1a50", "#3d2b78", "#5b44a8", "#7e6bc7", "#b8a8e0"],
    accent: { light: "#0891b2", dark: "#22d3ee" },
  },
  amber: {
    light: ["#fefcf0", "#f5e8b8", "#e6ca6e", "#c9a63a", "#a07e20", "#604a0a"],
    dark:  ["#1c1608", "#3a2e10", "#5e4c1e", "#8a7030", "#c9a63a", "#e6d48a"],
    accent: { light: "#7c3aed", dark: "#a78bfa" },
  },
  rose: {
    light: ["#fff5f7", "#f5ccd4", "#e6899a", "#d05570", "#a83050", "#701a32"],
    dark:  ["#1e0a10", "#3a1420", "#5e2838", "#a83050", "#d05570", "#e6a0b0"],
    accent: { light: "#0d9488", dark: "#5eead4" },
  },
};

/** WCAG relative luminance (0..1) of a `#rrggbb` hex color. */
function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0;
  const channel = (start: number) => {
    const c = parseInt(h.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Near-black foreground used when white fails contrast against a light accent. */
const DARK_FOREGROUND = "#0a0a0a";

/** WCAG non-text contrast minimum (3:1) used to decide when white is no longer legible. */
const NON_TEXT_CONTRAST_MIN = 3;

/**
 * Pick the action-bar glyph foreground for a given accent background. White is the
 * intended look and is kept for all saturated accents; near-black is used only as a
 * fallback when white drops below the WCAG 3:1 non-text minimum (lighter dark-mode
 * accents), so legibility is guaranteed without darkening normal accent buttons.
 */
export function pickReadableForeground(backgroundHex: string): string {
  const bg = relativeLuminance(backgroundHex);
  const contrastWhite = 1.05 / (bg + 0.05);
  return contrastWhite >= NON_TEXT_CONTRAST_MIN ? "#ffffff" : DARK_FOREGROUND;
}
