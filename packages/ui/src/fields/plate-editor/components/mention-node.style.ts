import { defineSlotStyle } from "../../../design/slot-style";

/** The mention element. */
export const plateMentionStyle = defineSlotStyle({
  slot: "plate-mention",
  base: "rounded-md bg-primary/10 px-1.5 py-0.5 text-sm font-medium text-primary",
  variants: {
    selected: { true: "ring-2 ring-primary ring-offset-1", false: "" },
  },
  defaultVariants: { selected: false },
});

/** The mention while it is being typed. */
export const plateMentionInputStyle = defineSlotStyle({
  slot: "plate-mention-input",
  base: "rounded-md bg-primary/10 px-1.5 py-0.5 text-sm",
  variants: {},
  defaultVariants: {},
});
