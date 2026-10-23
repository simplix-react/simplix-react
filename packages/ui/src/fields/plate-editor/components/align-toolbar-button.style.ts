import { defineSlotStyle } from "../../../design/slot-style";

/** The align trigger: a part on the toolbar button, which carries its own slot. */
export const plateAlignTriggerStyle = defineSlotStyle({
  slot: "plate-align-trigger",
  as: "part",
  base: "gap-0.5 px-1",
  variants: {},
  defaultVariants: {},
});

/** An align option: a part on the menu item, which carries its own slot. */
export const plateAlignItemStyle = defineSlotStyle({
  slot: "plate-align-item",
  as: "part",
  base: "gap-2 text-xs",
  variants: {},
  defaultVariants: {},
});
