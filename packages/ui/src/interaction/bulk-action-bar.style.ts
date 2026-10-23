import { defineSlotStyle } from "../design/slot-style";

/** The bar that rises over a list while rows are selected. */
export const bulkActionBarStyle = defineSlotStyle({
  slot: "bulk-action-bar",
  base: "gap-3 rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg [transition:transform_var(--dur-base)_var(--ease-spring),opacity_var(--dur-fast)_var(--ease)]",
  variants: {
    open: { true: "translate-y-0 opacity-100", false: "pointer-events-none translate-y-3 opacity-0" },
  },
  defaultVariants: { open: false },
});

/** The selected count at the start of the bar. */
export const bulkActionBarCountStyle = defineSlotStyle({
  slot: "bulk-action-bar-count",
  base: "font-semibold tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** Where the selection's actions sit, pushed to the end of the bar. */
export const bulkActionBarActionsStyle = defineSlotStyle({
  slot: "bulk-action-bar-actions",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});
