import { defineSlotStyle } from "../../design/slot-style";

/** The dropdown field chevron's classic look. Drawn by `theme/designs/classic.css`. */
export const fieldChevronStyle = defineSlotStyle({
  slot: "field-chevron",
  base: "opacity-50",
  variants: {
    trailing: { true: "-mr-1.5", false: "" },
  },
  defaultVariants: { trailing: false },
});
