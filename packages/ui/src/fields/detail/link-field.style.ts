import { defineSlotStyle } from "../../design/slot-style";

/** The anchor of a link field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailLinkFieldLinkStyle = defineSlotStyle({
  slot: "detail-link-field-link",
  base: "text-primary underline-offset-4 hover:underline",
  variants: {},
  defaultVariants: {},
});
