import { defineSlotStyle } from "../../design/slot-style";

/** The label's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const labelStyle = defineSlotStyle({
  slot: "label",
  base: "text-sm font-medium leading-none peer-disabled:opacity-70",
  variants: {},
  defaultVariants: {},
});
