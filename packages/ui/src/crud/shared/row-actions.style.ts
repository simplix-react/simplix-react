import { defineSlotStyle } from "../../design/slot-style";

/** The bordered strip that groups a row's icon actions. */
export const rowActionsStripStyle = defineSlotStyle({
  slot: "row-actions-strip",
  base: "rounded-md border",
  variants: {},
  defaultVariants: {},
});

/** An icon action inside the strip: square-cornered, ruled off from the one before it. */
export const rowActionsStripButtonStyle = defineSlotStyle({
  slot: "row-actions-strip-button",
  as: "part",
  base: "rounded-none",
  variants: { ruled: { true: "border-l", false: "" } },
  defaultVariants: { ruled: false },
});
