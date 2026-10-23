import { defineSlotStyle } from "../../../design/slot-style";

/** A bulleted or numbered list. */
export const plateListStyle = defineSlotStyle({
  slot: "plate-list",
  base: "pl-6 my-2",
  variants: {
    kind: { bulleted: "list-disc", numbered: "list-decimal" },
  },
  defaultVariants: {},
});

/** A list item. */
export const plateListItemStyle = defineSlotStyle({
  slot: "plate-list-item",
  base: "my-1",
  variants: {},
  defaultVariants: {},
});
