import { defineSlotStyle } from "../../design/slot-style";

/** A compact select trigger: a part on the trigger, which carries the select component's own slot. */
export const selectFieldCompactStyle = defineSlotStyle({
  slot: "field-select-compact",
  as: "part",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});

/** The label of the "no selection" entry. */
export const selectFieldClearTextStyle = defineSlotStyle({
  slot: "field-select-clear-text",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** An option row with an icon or tag. */
export const selectFieldOptionStyle = defineSlotStyle({
  slot: "field-select-option",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The tag at the trailing edge of an option. */
export const selectFieldTagStyle = defineSlotStyle({
  slot: "field-select-tag",
  base: "ml-auto text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The control and its messages when a compact select has messages to show. */
export const selectFieldStackStyle = defineSlotStyle({
  slot: "field-select-stack",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The hidden native select that measures the widest option. */
export const selectFieldMeasureStyle = defineSlotStyle({
  slot: "field-select-measure",
  base: "border px-3 pr-8 text-sm",
  variants: {},
  defaultVariants: {},
});
