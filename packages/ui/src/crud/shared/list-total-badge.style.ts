import { defineSlotStyle } from "../../design/slot-style";

/** The icon in the total badge. */
export const listTotalBadgeIconStyle = defineSlotStyle({
  slot: "list-total-badge-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The total badge: an outline badge with an icon, in regular weight. */
export const listTotalBadgeStyle = defineSlotStyle({
  slot: "list-total-badge",
  as: "part",
  base: "gap-1.5 font-normal",
  variants: {},
  defaultVariants: {},
});
