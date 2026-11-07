import { defineSlotStyle } from "../../design/slot-style";

/** The button that shows or hides a password. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const passwordToggleStyle = defineSlotStyle({
  slot: "field-password-toggle",
  base: "z-2 rounded-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});
