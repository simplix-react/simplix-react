import { defineSlotStyle } from "../../design/slot-style";

/** The placeholder an image field draws when there is no image. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailImageFieldPlaceholderStyle = defineSlotStyle({
  slot: "detail-image-field-placeholder",
  base: "rounded-md bg-muted text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The image of an image field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailImageFieldImageStyle = defineSlotStyle({
  slot: "detail-image-field-image",
  base: "rounded-md",
  variants: {},
  defaultVariants: {},
});
