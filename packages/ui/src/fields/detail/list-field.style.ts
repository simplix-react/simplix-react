import { defineSlotStyle } from "../../design/slot-style";

/** The badge row of a list field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailListFieldBadgesStyle = defineSlotStyle({
  slot: "detail-list-field-badges",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The bullet list of a list field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailListFieldBulletsStyle = defineSlotStyle({
  slot: "detail-list-field-bullets",
  base: "space-y-0.5",
  variants: {},
  defaultVariants: {},
});
