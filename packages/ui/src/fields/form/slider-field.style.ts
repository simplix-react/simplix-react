import { defineSlotStyle } from "../../design/slot-style";

/** The slider and its value readout in one row. */
export const sliderFieldRowStyle = defineSlotStyle({
  slot: "field-slider-row",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** The value readout beside the slider. */
export const sliderFieldValueStyle = defineSlotStyle({
  slot: "field-slider-value",
  base: "text-right text-sm tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
