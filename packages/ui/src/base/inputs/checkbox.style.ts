import { defineSlotStyle } from "../../design/slot-style";

/** The checkbox box's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const checkboxStyle = defineSlotStyle({
  slot: "checkbox",
  base: "rounded-sm border border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The checkbox's check or dash glyph holder. */
export const checkboxIndicatorStyle = defineSlotStyle({
  slot: "checkbox-indicator",
  // Timing for the grow-in the component puts on the mark.
  base: "text-current duration-[var(--dur-fast)] ease-[var(--ease-spring)]",
  variants: {},
  defaultVariants: {},
});
