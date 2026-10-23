import { defineSlotStyle } from "../../../design/slot-style";

/** The highlight leaf. */
export const plateHighlightStyle = defineSlotStyle({
  slot: "plate-highlight",
  base: "bg-yellow-200 dark:bg-yellow-800/50 px-0.5",
  variants: {},
  defaultVariants: {},
});

/** The keyboard shortcut leaf. */
export const plateKbdStyle = defineSlotStyle({
  slot: "plate-kbd",
  base: "rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs shadow-sm",
  variants: {},
  defaultVariants: {},
});
