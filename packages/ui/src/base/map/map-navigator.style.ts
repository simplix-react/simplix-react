import { defineSlotStyle } from "../../design/slot-style";

/** The strip that keeps the navigator off the map edge. */
export const mapNavigatorStyle = defineSlotStyle({
  slot: "map-navigator",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});

/**
 * The bordered bar holding the previous button, the position label and the next button.
 *
 * The outer buttons give up their own corners so the bar's border reads as one shape.
 */
export const mapNavigatorBarStyle = defineSlotStyle({
  slot: "map-navigator-bar",
  base: "rounded-md border bg-background shadow-md [&>:first-child]:rounded-none [&>:first-child]:rounded-l-md [&>:last-child]:rounded-none [&>:last-child]:rounded-r-md",
  variants: {},
  defaultVariants: {},
});

/** The line between two parts of the bar. */
export const mapNavigatorSeparatorStyle = defineSlotStyle({
  slot: "map-navigator-separator",
  base: "bg-border",
  variants: {},
  defaultVariants: {},
});

/** The button showing the focused position and label. */
export const mapNavigatorSelectStyle = defineSlotStyle({
  slot: "map-navigator-select",
  base: "gap-1.5 px-3 py-1 text-xs font-medium hover:bg-accent transition-colors",
  variants: {},
  defaultVariants: {},
});

/** The muted counters beside the label. */
export const mapNavigatorCounterStyle = defineSlotStyle({
  slot: "map-navigator-counter",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
