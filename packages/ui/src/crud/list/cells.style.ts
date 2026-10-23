import { defineSlotStyle } from "../../design/slot-style";

/** A cell that shows a flag beside its text. */
export const cellFlagRowStyle = defineSlotStyle({
  slot: "cell-flag-row",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The box a country flag is clipped to. */
export const cellFlagStyle = defineSlotStyle({
  slot: "cell-flag",
  base: "rounded-[1px]",
  variants: {},
  defaultVariants: {},
});
