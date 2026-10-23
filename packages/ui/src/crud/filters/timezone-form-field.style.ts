import { defineSlotStyle } from "../../design/slot-style";

/** The zone's name in an option of the timezone list. */
export const crudTimezoneNameStyle = defineSlotStyle({
  slot: "crud-timezone-name",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});

/** The zone's localised name under its identifier. */
export const crudTimezoneLocalNameStyle = defineSlotStyle({
  slot: "crud-timezone-local-name",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
