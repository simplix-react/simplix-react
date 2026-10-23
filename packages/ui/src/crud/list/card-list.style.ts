import { defineSlotStyle } from "../../design/slot-style";

/** The placeholder shown when a card list has no items. */
export const cardListEmptyStyle = defineSlotStyle({
  slot: "card-list-empty",
  as: "part",
  base: "py-12",
  variants: {},
  defaultVariants: {},
});

/** The text of the empty placeholder. */
export const cardListEmptyTextStyle = defineSlotStyle({
  slot: "card-list-empty-text",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
