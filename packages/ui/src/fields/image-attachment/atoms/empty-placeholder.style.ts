import { defineSlotStyle } from "../../../design/slot-style";

/** The stage shown when there is no image. */
export const emptyPlaceholderStyle = defineSlotStyle({
  slot: "empty-placeholder",
  base: "bg-muted text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The icon and text column. */
export const emptyPlaceholderBodyStyle = defineSlotStyle({
  slot: "empty-placeholder-body",
  base: "gap-2 text-center p-5",
  variants: {},
  defaultVariants: {},
});

/** The default placeholder glyph. */
export const emptyPlaceholderIconStyle = defineSlotStyle({
  slot: "empty-placeholder-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The placeholder title. */
export const emptyPlaceholderTitleStyle = defineSlotStyle({
  slot: "empty-placeholder-title",
  base: "text-(length:--fs-cell) leading-(--lh-cell) font-semibold text-secondary-foreground",
  variants: {},
  defaultVariants: {},
});

/** The placeholder description. */
export const emptyPlaceholderDescriptionStyle = defineSlotStyle({
  slot: "empty-placeholder-description",
  base: "text-(length:--fs-caption) leading-(--lh-caption) text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
