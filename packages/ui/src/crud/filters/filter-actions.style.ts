import { defineSlotStyle } from "../../design/slot-style";

/**
 * The clear and search buttons at the end of a filter bar.
 *
 * <p>The buttons are the shared `Button`, whose own slot is fixed, so how they join into one
 * control is written as rules on this wrapper against its button children.
 */
export const crudFilterActionsStyle = defineSlotStyle({
  slot: "crud-filter-actions",
  base: "[&>button:last-child>svg]:mr-1",
  variants: {
    // With a clear button present the two share one outline; alone the search button is wider.
    active: {
      true: "[&>button:first-child]:rounded-r-none [&>button:first-child]:border-r-0 [&>button:last-child]:rounded-l-none",
      false: "[&>button:last-child]:px-[1.75rem]",
    },
  },
  defaultVariants: { active: false },
});
