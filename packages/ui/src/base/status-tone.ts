/**
 * Semantic status/severity tone tokens.
 *
 * Single source of truth for status coloring across the UI. Each tone bundles
 * the Tailwind class strings (with their `dark:` variants) for every place a
 * status color is consumed — filled badge, outline badge, indicator dot, ping
 * ring, standalone icon, soft surface tint — plus chart hex values for chart
 * libraries that cannot consume Tailwind classes.
 *
 * Tones are palette-literal (not bound to the `--success`/`--warning` theme
 * variables) so that adopting them does not shift any existing badge/indicator
 * color: the classes below are exactly what the modules hand-wrote before
 * commonization.
 *
 * Note: this `StatusTone` is the status/severity vocabulary and is intentionally
 * distinct from the typography `tone` axis on `Text`/`Heading`
 * (default/muted/primary/destructive).
 */
import type { ComponentType } from "react";

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "pending"
  | "processing";

/**
 * Structural type for an icon component (e.g. a lucide-react icon).
 *
 * Typed structurally — by the props it is rendered with — rather than nominally
 * against a specific `lucide-react` version's `LucideIcon`, so components that
 * accept an icon stay compatible regardless of which lucide-react version a
 * consumer resolves.
 */
export type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/** Per-tone Tailwind class bundle (every slot carries its own `dark:` variant). */
export interface StatusToneToken {
  /** Filled badge: solid soft background + readable text. */
  badge: string;
  /** Outline badge: colored border + text on a transparent background. */
  outline: string;
  /** Solid indicator dot background (500-level). */
  dot: string;
  /** Translucent ring background used behind a dot/icon for ping/flash. */
  ring: string;
  /** Standalone icon color. */
  icon: string;
  /** Soft surface tint (border + background) for cards/banners. */
  surface: string;
  /** Chart hex for light mode. */
  chart: string;
  /** Chart hex for dark mode. */
  chartDark: string;
}

/**
 * The tone table. Hue assignments:
 * success→emerald, warning→amber, danger→red, info→blue, neutral→slate,
 * pending→orange (distinct "awaiting action" hue), processing→blue (shares the
 * info hue; conventionally rendered with `pulse`/animation to signal in-flight).
 */
export const STATUS_TONES: Record<StatusTone, StatusToneToken> = {
  success: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
    outline: "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400",
    dot: "bg-emerald-500",
    ring: "bg-emerald-400",
    icon: "text-emerald-500 dark:text-emerald-400",
    surface: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/50",
    chart: "#10b981",
    chartDark: "#34d399",
  },
  warning: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    outline: "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
    dot: "bg-amber-500",
    ring: "bg-amber-400",
    icon: "text-amber-500 dark:text-amber-400",
    surface: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/50",
    chart: "#f59e0b",
    chartDark: "#fbbf24",
  },
  danger: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    outline: "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
    dot: "bg-red-500",
    ring: "bg-red-400",
    icon: "text-red-500 dark:text-red-400",
    surface: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/50",
    chart: "#ef4444",
    chartDark: "#f87171",
  },
  info: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    outline: "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400",
    dot: "bg-blue-500",
    ring: "bg-blue-400",
    icon: "text-blue-500 dark:text-blue-400",
    surface: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/50",
    chart: "#3b82f6",
    chartDark: "#60a5fa",
  },
  neutral: {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    outline: "border-border text-muted-foreground",
    dot: "bg-slate-400 dark:bg-slate-600",
    ring: "bg-slate-400",
    icon: "text-muted-foreground",
    surface: "border-border bg-muted/30 dark:bg-muted/20",
    chart: "#94a3b8",
    chartDark: "#64748b",
  },
  pending: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    outline: "border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400",
    dot: "bg-orange-500",
    ring: "bg-orange-400",
    icon: "text-orange-500 dark:text-orange-400",
    surface: "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/50",
    chart: "#f97316",
    chartDark: "#fb923c",
  },
  processing: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    outline: "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400",
    dot: "bg-blue-500",
    ring: "bg-blue-400",
    icon: "text-blue-500 dark:text-blue-400",
    surface: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/50",
    chart: "#3b82f6",
    chartDark: "#60a5fa",
  },
};

/** Ordered list of all tones (stable iteration for tests/storybook). */
export const STATUS_TONE_NAMES: readonly StatusTone[] = [
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
  "pending",
  "processing",
];

/**
 * Resolve a single slot's Tailwind class string for a tone.
 *
 * @param tone - Semantic status tone.
 * @param slot - Which slot of the tone token to read (e.g. `badge`, `dot`, `surface`).
 * @returns The Tailwind class string (carrying its own `dark:` variant) for that tone/slot.
 *
 * @example
 * ```tsx
 * <span className={statusToneClass("success", "badge")}>Active</span>
 * ```
 */
export function statusToneClass(tone: StatusTone, slot: keyof StatusToneToken): string {
  return STATUS_TONES[tone][slot];
}
