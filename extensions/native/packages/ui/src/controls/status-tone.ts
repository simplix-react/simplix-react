/**
 * Semantic status/severity tone tokens — the React Native mirror of the web
 * `StatusTone` vocabulary. Each tone bundles NativeWind class strings (with
 * `dark:` variants) for the slots a status color is consumed in.
 *
 * Tones are palette-literal (not bound to the `--success`/`--warning` theme
 * variables), matching the web hue assignments: success→emerald,
 * warning→amber, danger→red, info→blue, neutral→slate, pending→orange,
 * processing→blue.
 */

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "pending"
  | "processing";

/** Per-tone NativeWind class bundle. */
export interface StatusToneToken {
  /** Filled badge container: solid soft background. */
  badge: string;
  /** Filled badge text color. */
  badgeText: string;
  /** Outline badge container: colored border on transparent background. */
  outline: string;
  /** Outline badge text color. */
  outlineText: string;
  /** Solid indicator dot background (500-level). */
  dot: string;
  /** Standalone icon/text color. */
  icon: string;
  /** Soft surface tint (border + background) for cards/banners. */
  surface: string;
  /** Text color readable on the soft surface. */
  surfaceText: string;
}

/** The tone table. */
export const STATUS_TONES: Record<StatusTone, StatusToneToken> = {
  success: {
    badge: "bg-emerald-100 dark:bg-emerald-900/40",
    badgeText: "text-emerald-800 dark:text-emerald-200",
    outline: "border-emerald-500",
    outlineText: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    surface: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40",
    surfaceText: "text-emerald-900 dark:text-emerald-100",
  },
  warning: {
    badge: "bg-amber-100 dark:bg-amber-900/40",
    badgeText: "text-amber-800 dark:text-amber-200",
    outline: "border-amber-500",
    outlineText: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    surface: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
    surfaceText: "text-amber-900 dark:text-amber-100",
  },
  danger: {
    badge: "bg-red-100 dark:bg-red-900/40",
    badgeText: "text-red-800 dark:text-red-200",
    outline: "border-red-500",
    outlineText: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    icon: "text-red-600 dark:text-red-400",
    surface: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40",
    surfaceText: "text-red-900 dark:text-red-100",
  },
  info: {
    badge: "bg-blue-100 dark:bg-blue-900/40",
    badgeText: "text-blue-800 dark:text-blue-200",
    outline: "border-blue-500",
    outlineText: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    surface: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40",
    surfaceText: "text-blue-900 dark:text-blue-100",
  },
  neutral: {
    badge: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-200",
    outline: "border-slate-400",
    outlineText: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
    icon: "text-slate-500 dark:text-slate-400",
    surface: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60",
    surfaceText: "text-slate-900 dark:text-slate-100",
  },
  pending: {
    badge: "bg-orange-100 dark:bg-orange-900/40",
    badgeText: "text-orange-800 dark:text-orange-200",
    outline: "border-orange-500",
    outlineText: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    icon: "text-orange-600 dark:text-orange-400",
    surface: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40",
    surfaceText: "text-orange-900 dark:text-orange-100",
  },
  processing: {
    badge: "bg-blue-100 dark:bg-blue-900/40",
    badgeText: "text-blue-800 dark:text-blue-200",
    outline: "border-blue-500",
    outlineText: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    surface: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40",
    surfaceText: "text-blue-900 dark:text-blue-100",
  },
};
