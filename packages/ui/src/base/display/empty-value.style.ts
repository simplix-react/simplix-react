import { defineSlotStyle } from "../../design/slot-style";

/** The muted placeholder for a missing value. */
export const emptyValueStyle = defineSlotStyle({
  slot: "empty-value",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
