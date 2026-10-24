import { defineSlotStyle } from "../design/slot-style";

/** The grid primitive's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const gridStyle = defineSlotStyle({
  slot: "grid",
  base: "",
  variants: {
    gap: {
      none: "gap-0",
      px: "gap-px",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    // Per-axis overrides sit after `gap` so they win over it.
    gapx: {
      none: "gap-x-0",
      px: "gap-x-px",
      xs: "gap-x-1",
      sm: "gap-x-2",
      md: "gap-x-4",
      lg: "gap-x-6",
      xl: "gap-x-8",
    },
    gapy: {
      none: "gap-y-0",
      px: "gap-y-px",
      xs: "gap-y-1",
      sm: "gap-y-2",
      md: "gap-y-4",
      lg: "gap-y-6",
      xl: "gap-y-8",
    },
    /**
     * The column rule on the cells that follow another in their row, which the grid marks with
     * the `grid-column-rule` class. The value is the horizontal gap, which fixes the offset (the
     * cell is widened by half a gutter and padded back by the same amount, which puts the line
     * mid-gutter), with `-collapsing` for a grid that drops to one column at narrow widths and so
     * draws the rule only from the `@sm` container width up.
     */
    rule: {
      none: "[&>.grid-column-rule]:border-l",
      "none-collapsing": "@sm:[&>.grid-column-rule]:border-l",
      px: "[&>.grid-column-rule]:border-l",
      "px-collapsing": "@sm:[&>.grid-column-rule]:border-l",
      xs: "[&>.grid-column-rule]:-ml-0.5 [&>.grid-column-rule]:border-l [&>.grid-column-rule]:pl-0.5",
      "xs-collapsing": "@sm:[&>.grid-column-rule]:-ml-0.5 @sm:[&>.grid-column-rule]:border-l @sm:[&>.grid-column-rule]:pl-0.5",
      sm: "[&>.grid-column-rule]:-ml-1 [&>.grid-column-rule]:border-l [&>.grid-column-rule]:pl-1",
      "sm-collapsing": "@sm:[&>.grid-column-rule]:-ml-1 @sm:[&>.grid-column-rule]:border-l @sm:[&>.grid-column-rule]:pl-1",
      md: "[&>.grid-column-rule]:-ml-2 [&>.grid-column-rule]:border-l [&>.grid-column-rule]:pl-2",
      "md-collapsing": "@sm:[&>.grid-column-rule]:-ml-2 @sm:[&>.grid-column-rule]:border-l @sm:[&>.grid-column-rule]:pl-2",
      lg: "[&>.grid-column-rule]:-ml-3 [&>.grid-column-rule]:border-l [&>.grid-column-rule]:pl-3",
      "lg-collapsing": "@sm:[&>.grid-column-rule]:-ml-3 @sm:[&>.grid-column-rule]:border-l @sm:[&>.grid-column-rule]:pl-3",
      xl: "[&>.grid-column-rule]:-ml-4 [&>.grid-column-rule]:border-l [&>.grid-column-rule]:pl-4",
      "xl-collapsing": "@sm:[&>.grid-column-rule]:-ml-4 @sm:[&>.grid-column-rule]:border-l @sm:[&>.grid-column-rule]:pl-4",
    },
  },
  defaultVariants: { gap: "md" },
});
