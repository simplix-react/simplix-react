import { defineSlotStyle } from "../../design/slot-style";

/** The pulsing placeholder drawn while content loads. */
export const skeletonStyle = defineSlotStyle({
  slot: "skeleton",
  base: "animate-pulse rounded-md bg-muted",
  variants: {},
  defaultVariants: {},
});
