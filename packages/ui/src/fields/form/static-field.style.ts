import { defineSlotStyle } from "../../design/slot-style";

/** The value a static field shows when no children are given. */
export const staticFieldValueStyle = defineSlotStyle({
  slot: "field-static-value",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});
