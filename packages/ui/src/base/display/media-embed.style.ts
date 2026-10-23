import { defineSlotStyle } from "../../design/slot-style";

/** The bordered frame around an embedded video or document. */
export const mediaEmbedStyle = defineSlotStyle({
  slot: "media-embed",
  base: "rounded-md border",
  variants: {},
  defaultVariants: {},
});
