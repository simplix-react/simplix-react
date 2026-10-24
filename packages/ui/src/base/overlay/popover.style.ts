import { defineSlotStyle } from "../../design/slot-style";

/**
 * The popover panel.
 *
 * `outline-none` is on the container, and only on the container. Radix moves focus here when the
 * popover opens; it is a region rather than a control, and what is inside rings normally.
 */
export const popoverContentStyle = defineSlotStyle({
  slot: "popover-content",
  base: "rounded-[var(--radius-overlay)] border bg-popover p-4 text-popover-foreground shadow-md outline-none duration-[var(--dur-base)] ease-[var(--ease-spring)] data-[state=closed]:ease-[var(--ease)]",
  variants: {
    /** Drops the panel padding, for a body that draws its own. */
    flush: { true: "p-0", false: "" },
  },
  defaultVariants: { flush: false },
});
