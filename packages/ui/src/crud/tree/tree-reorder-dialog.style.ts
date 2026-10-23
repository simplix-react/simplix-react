import { defineSlotStyle } from "../../design/slot-style";

/** One sortable row. */
export const treeReorderItemStyle = defineSlotStyle({
  slot: "tree-reorder-item",
  base: "gap-2 rounded-md border bg-background px-3 py-2",
  variants: { dragging: { true: "shadow-md opacity-90", false: "" } },
  defaultVariants: { dragging: false },
});

/** The grip a reader drags a row by. */
export const treeReorderGripStyle = defineSlotStyle({
  slot: "tree-reorder-grip",
  base: "text-muted-foreground hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** A row's name. */
export const treeReorderLabelStyle = defineSlotStyle({
  slot: "tree-reorder-label",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});

/** The scrolling area that holds the rows. */
export const treeReorderListStyle = defineSlotStyle({
  slot: "tree-reorder-list",
  base: "py-2",
  variants: {},
  defaultVariants: {},
});

/** The message shown when there is nothing to reorder. */
export const treeReorderEmptyStyle = defineSlotStyle({
  slot: "tree-reorder-empty",
  base: "py-6 text-center text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
