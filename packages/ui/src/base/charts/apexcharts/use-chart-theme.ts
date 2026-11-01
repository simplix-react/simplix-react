import { useEffect, useState } from "react";

/**
 * Resolve a CSS custom property to a hex color string.
 * Uses Canvas2D which always returns a reliable hex value,
 * regardless of the input color space (hsl, oklch, etc.).
 */
function resolveColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;

  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  // A value the canvas refuses leaves its previous fill (black), so the fallback is set first.
  ctx.fillStyle = fallback;
  ctx.fillStyle = cssColorOf(raw);
  return ctx.fillStyle;
}

/**
 * The CSS colour a custom property's value names. Only a legacy bare HSL triple ("240 10% 3.9%")
 * is wrapped in `hsl()`; a hex value, a colour function or a keyword is a colour already, and
 * wrapping it makes the canvas refuse it.
 */
export function cssColorOf(raw: string): string {
  return /^-?[\d.]+(deg|rad|turn)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(raw) ? `hsl(${raw})` : raw;
}

/** Convert any color resolved by Canvas2D to #rrggbb (stripping alpha). */
export function toHex6(color: string): string {
  if (color.startsWith("#")) return color.slice(0, 7);
  const m = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return color;
  return `#${Number(m[1]).toString(16).padStart(2, "0")}${Number(m[2]).toString(16).padStart(2, "0")}${Number(m[3]).toString(16).padStart(2, "0")}`;
}

function resolveTheme() {
  const border = resolveColor("--border", "#e4e4e7");
  const mutedFg = resolveColor("--muted-foreground", "#71717a");
  const bg = resolveColor("--background", "#ffffff");
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return {
    foreground: resolveColor("--foreground", "#09090b"),
    mutedForeground: mutedFg,
    border,
    borderLight: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    background: bg,
    // The theme's own ramp ends and selection mark, for a chart drawn in the product's colours.
    muted: resolveColor("--muted", "#f4f4f5"),
    primary: resolveColor("--primary", "#18181b"),
    ring: resolveColor("--ring", "#3b82f6"),
    fontFamily: "inherit",
    tooltipTheme: (isDark ? "dark" : "light") as "dark" | "light",
  };
}

/** Hide the grid outer rect (top/right/bottom/left frame) while keeping internal grid lines. */
export function hideGridRect(chart: ApexCharts) {
  const el = (chart as unknown as { el?: Element }).el;
  const rect = el?.querySelector?.(".apexcharts-gridRect");
  if (rect) rect.setAttribute("stroke", "none");
}

export function useChartTheme() {
  const [theme, setTheme] = useState(resolveTheme);

  useEffect(() => {
    const update = () => setTheme(resolveTheme());

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return theme;
}
