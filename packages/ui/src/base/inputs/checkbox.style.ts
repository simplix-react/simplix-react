import { defineSlotStyle } from "../../design/slot-style";

/** The checkbox box's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const checkboxStyle = defineSlotStyle({
  slot: "checkbox",
  base: "rounded-sm border border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
  variants: {},
  defaultVariants: {},
});

/** The checkbox's check or dash glyph holder. */
export const checkboxIndicatorStyle = defineSlotStyle({
  slot: "checkbox-indicator",
  base: "text-current",
  variants: {},
  defaultVariants: {},
});
