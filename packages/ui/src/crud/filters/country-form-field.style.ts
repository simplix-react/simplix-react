import { defineSlotStyle } from "../../design/slot-style";

/**
 * A form-style filter field: a caption row above a searchable list.
 *
 * <p>The caption is the shared `Label` and the list is the shared `Command`, whose own slots are
 * fixed, so what this field changes about them is written as rules against them.
 */
export const crudFilterListFieldStyle = defineSlotStyle({
  slot: "crud-filter-list-field",
  base: "gap-1 [&>div>label]:text-xs [&>div>label]:font-medium [&>div>label]:text-muted-foreground [&>[cmdk-root]]:rounded-md [&>[cmdk-root]]:border",
  variants: {},
  defaultVariants: {},
});

/** The flag in front of a country's name. */
export const crudCountryFlagStyle = defineSlotStyle({
  slot: "crud-country-flag",
  base: "mr-2 [&>*]:rounded-[1px]",
  variants: {},
  defaultVariants: {},
});
