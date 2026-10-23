import { defineSlotStyle } from "../design/slot-style";

/** The header row of a side panel. */
export const panelHeaderStyle = defineSlotStyle({
  slot: "panel-header",
  base: "gap-2 border-b px-0 py-4",
  variants: {},
  defaultVariants: {},
});

/** The description under a panel title. */
export const panelHeaderDescriptionStyle = defineSlotStyle({
  slot: "panel-header-description",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
