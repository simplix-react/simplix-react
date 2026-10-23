import { defineSlotStyle } from "../../design/slot-style";

/** The radio group container's classic look. Drawn by `theme/designs/classic.css`. */
export const radioGroupStyle = defineSlotStyle({
  slot: "radio-group",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** One radio item's classic look. */
export const radioGroupItemStyle = defineSlotStyle({
  slot: "radio-group-item",
  base: "rounded-full border border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});
