import { defineSlotStyle } from "../../design/slot-style";

/** One row of a detail list. */
export const detailListRowStyle = defineSlotStyle({
  slot: "detail-list-row",
  base: "gap-4 border-b px-4 last:border-b-0",
  variants: {
    /** A row with an `onClick` is a button: hover background and a focus ring. */
    interactive: {
      true: "transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

/** The bordered, rounded group that holds the rows. */
export const detailListStyle = defineSlotStyle({
  slot: "detail-list",
  base: "rounded-lg border",
  variants: {},
  defaultVariants: {},
});

/** The footer docked under the last row of a detail list. */
export const detailListFooterStyle = defineSlotStyle({
  slot: "detail-list-footer",
  base: "border-t",
  variants: {},
  defaultVariants: {},
});

/**
 * The primary label of a row: a part on the text primitive, which carries its own slot. Drawn
 * here rather than through the primitive's `weight`, which the primitive does not draw.
 */
export const detailListRowPrimaryStyle = defineSlotStyle({
  slot: "detail-list-row-primary",
  as: "part",
  base: "font-medium",
  variants: {},
  defaultVariants: {},
});
