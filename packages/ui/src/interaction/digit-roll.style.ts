import { defineSlotStyle } from "../design/slot-style";

/** A figure whose digits roll to their new value. */
export const digitRollStyle = defineSlotStyle({
  slot: "digit-roll",
  base: "tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** One digit's column: the ten digits stacked, moved so the current one shows. */
export const digitRollColumnStyle = defineSlotStyle({
  slot: "digit-roll-column",
  base: "[transition:transform_var(--dur-slow)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});
