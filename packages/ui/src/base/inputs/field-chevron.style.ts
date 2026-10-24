import { defineSlotStyle } from "../../design/slot-style";

/** The dropdown field chevron's classic look. Drawn by `theme/designs/classic.css`. */
export const fieldChevronStyle = defineSlotStyle({
  slot: "field-chevron",
  // Decorative: a click on the caret reaches the trigger under it.
  base: "pointer-events-none opacity-50",
  variants: {
    trailing: { true: "-mr-1.5", false: "" },
  },
  defaultVariants: { trailing: false },
});
