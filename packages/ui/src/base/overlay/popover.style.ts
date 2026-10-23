import { defineSlotStyle } from "../../design/slot-style";

/**
 * The popover panel.
 *
 * `outline-none` is on the container, and only on the container. Radix moves focus here when the
 * popover opens; it is a region rather than a control, and what is inside rings normally.
 */
export const popoverContentStyle = defineSlotStyle({
  slot: "popover-content",
  base: "rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
  variants: {
    /** Drops the panel padding, for a body that draws its own. */
    flush: { true: "p-0", false: "" },
  },
  defaultVariants: { flush: false },
});
