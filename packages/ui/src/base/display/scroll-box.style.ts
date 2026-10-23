import { defineSlotStyle } from "../../design/slot-style";

/** The bounded box that scrolls long read-through content. */
export const scrollBoxStyle = defineSlotStyle({
  slot: "scroll-box",
  base: "rounded-md border p-3 text-sm",
  variants: {},
  defaultVariants: {},
});
