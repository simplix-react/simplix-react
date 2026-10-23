import { defineSlotStyle } from "../../design/slot-style";

/** The shaded box a block field draws its content in. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailBlockFieldContentStyle = defineSlotStyle({
  slot: "detail-block-field-content",
  base: "rounded-md bg-muted/50 px-3 py-2 text-left text-foreground",
  variants: {},
  defaultVariants: {},
});
