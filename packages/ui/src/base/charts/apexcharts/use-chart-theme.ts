import { useMemo } from "react";

/** Resolve CSS custom properties for chart theming */
function getCSSVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function useChartTheme() {
  return useMemo(() => {
    const foreground = getCSSVar("--foreground", "#09090b");
    const mutedForeground = getCSSVar("--muted-foreground", "#71717a");
    const border = getCSSVar("--border", "#e4e4e7");
    const background = getCSSVar("--background", "#ffffff");

    return {
      foreground: `hsl(${foreground})`,
      mutedForeground: `hsl(${mutedForeground})`,
      border: `hsl(${border})`,
      background: `hsl(${background})`,
      fontFamily: "inherit",
    };
  }, []);
}
