import type { BadgeVariant, CalendarColor } from "../model/types";

/** Filled color treatment shared by month badges, week/day blocks, and agenda cards. */
const ITEM_COLOR_CLASSES: Record<CalendarColor, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600",
  green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600",
  red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600",
  purple: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600",
  orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600",
  gray: "border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",
  teal: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300 [&_.event-dot]:fill-teal-600",
};

/** Neutral background with a colored dot marker (the "dot" badge variant). */
const ITEM_DOT_CLASSES: Record<CalendarColor, string> = {
  blue: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600",
  green: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600",
  red: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600",
  yellow: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600",
  purple: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600",
  orange: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600",
  gray: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600",
  teal: "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-teal-600",
};

/** Saturated fill for resource-timeline bars — pale month-badge tones are illegible at bar scale. */
const TIMELINE_BAR_CLASSES: Record<CalendarColor, string> = {
  blue: "border-blue-600 bg-blue-500/80 text-white",
  green: "border-green-600 bg-green-500/80 text-white",
  red: "border-red-600 bg-red-500/80 text-white",
  yellow: "border-yellow-500 bg-yellow-400/80 text-yellow-950",
  purple: "border-purple-600 bg-purple-500/80 text-white",
  orange: "border-orange-600 bg-orange-500/80 text-white",
  gray: "border-neutral-400 bg-neutral-300/70 text-neutral-800 dark:border-neutral-600 dark:bg-neutral-700/70 dark:text-neutral-200",
  teal: "border-teal-600 bg-teal-500/80 text-white",
};

/** Resolve the saturated bar classes used by the resource-timeline view. */
export function timelineBarClass(color: CalendarColor): string {
  return TIMELINE_BAR_CLASSES[color];
}

/** Resolve the color classes for an item given the active badge variant. */
export function itemColorClass(color: CalendarColor, badgeVariant: BadgeVariant): string {
  return badgeVariant === "dot" ? ITEM_DOT_CLASSES[color] : ITEM_COLOR_CLASSES[color];
}

/** Subtle full-cell/axis background tint used for day highlights (e.g. holidays). */
const DAY_HIGHLIGHT_BG: Record<CalendarColor, string> = {
  blue: "bg-blue-50 dark:bg-blue-950/40",
  green: "bg-green-50 dark:bg-green-950/40",
  red: "bg-red-50 dark:bg-red-950/40",
  yellow: "bg-yellow-50 dark:bg-yellow-950/40",
  purple: "bg-purple-50 dark:bg-purple-950/40",
  orange: "bg-orange-50 dark:bg-orange-950/40",
  gray: "bg-neutral-100 dark:bg-neutral-800/40",
  teal: "bg-teal-50 dark:bg-teal-950/40",
};

/** Text color for a day-highlight label. */
const DAY_HIGHLIGHT_TEXT: Record<CalendarColor, string> = {
  blue: "text-blue-700 dark:text-blue-300",
  green: "text-green-700 dark:text-green-300",
  red: "text-red-700 dark:text-red-300",
  yellow: "text-yellow-700 dark:text-yellow-300",
  purple: "text-purple-700 dark:text-purple-300",
  orange: "text-orange-700 dark:text-orange-300",
  gray: "text-neutral-700 dark:text-neutral-300",
  teal: "text-teal-700 dark:text-teal-300",
};

export function dayHighlightBgClass(color: CalendarColor): string {
  return DAY_HIGHLIGHT_BG[color];
}

export function dayHighlightTextClass(color: CalendarColor): string {
  return DAY_HIGHLIGHT_TEXT[color];
}

/** Solid dot fill used for bullets and zero-duration timeline markers. */
const DOT_BG: Record<CalendarColor, string> = {
  blue: "bg-blue-600 dark:bg-blue-500",
  green: "bg-green-600 dark:bg-green-500",
  red: "bg-red-600 dark:bg-red-500",
  yellow: "bg-yellow-600 dark:bg-yellow-500",
  purple: "bg-purple-600 dark:bg-purple-500",
  orange: "bg-orange-600 dark:bg-orange-500",
  gray: "bg-neutral-600 dark:bg-neutral-500",
  teal: "bg-teal-600 dark:bg-teal-500",
};

export function dotBgClass(color: CalendarColor): string {
  return DOT_BG[color];
}
