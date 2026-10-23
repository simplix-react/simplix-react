import { defineSlotStyle } from "../../../design/slot-style";

/** The horizontal rule element. */
export const plateHorizontalRuleStyle = defineSlotStyle({
  slot: "plate-horizontal-rule",
  base: "py-2",
  variants: {},
  defaultVariants: {},
});

/** The drawn line of a horizontal rule. */
export const plateHorizontalRuleLineStyle = defineSlotStyle({
  slot: "plate-horizontal-rule-line",
  base: "bg-border",
  variants: {},
  defaultVariants: {},
});
