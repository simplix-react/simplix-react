import { defineSlotStyle } from "../../../design/slot-style";

/** The chevron of the block type button. */
export const plateTurnIntoChevronStyle = defineSlotStyle({
  slot: "plate-turn-into-chevron",
  base: "opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The glyph of a block type option. */
export const plateTurnIntoIconStyle = defineSlotStyle({
  slot: "plate-turn-into-icon",
  base: "mr-2",
  variants: {},
  defaultVariants: {},
});

/** The block type trigger: a part on the toolbar button, which carries its own slot. */
export const plateTurnIntoTriggerStyle = defineSlotStyle({
  slot: "plate-turn-into-trigger",
  as: "part",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** A block type option: a part on the menu item, which carries its own slot; `active` marks the current block type. */
export const plateTurnIntoOptionStyle = defineSlotStyle({
  slot: "plate-turn-into-option",
  as: "part",
  base: "",
  variants: {
    active: { true: "bg-accent", false: "" },
  },
  defaultVariants: { active: false },
});
