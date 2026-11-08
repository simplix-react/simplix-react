import { defineSlotStyle } from "../../design/slot-style";

/** The small cross that clears one filter field. Drawn by `theme/designs/classic.css`. */
export const crudFieldClearButtonStyle = defineSlotStyle({
  slot: "crud-field-clear-button",
  base: "rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    // A cleared chip keeps the button's box so the chip does not change width.
    hidden: { true: "opacity-0", false: "" },
  },
  defaultVariants: { hidden: false },
});
