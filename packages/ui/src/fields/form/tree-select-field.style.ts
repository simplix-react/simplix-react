import { defineSlotStyle } from "../../design/slot-style";

/** One row of a tree select list. */
export const treeSelectRowStyle = defineSlotStyle({
  slot: "field-tree-row",
  base: "gap-1 rounded-sm px-2 py-1.5 text-sm",
  variants: {
    selected: { true: "bg-accent text-accent-foreground", false: "" },
    hoverable: { true: "hover:bg-accent/50", false: "" },
    disabled: { true: "cursor-not-allowed opacity-50", false: "" },
  },
  defaultVariants: { selected: false, hoverable: false, disabled: false },
});

/** The button that expands or collapses a branch. */
export const treeSelectToggleStyle = defineSlotStyle({
  slot: "field-tree-toggle",
  base: "rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {
    branch: { true: "text-muted-foreground hover:text-foreground", false: "" },
  },
  defaultVariants: { branch: false },
});

/** The button that chooses a node. */
export const treeSelectChooseStyle = defineSlotStyle({
  slot: "field-tree-choose",
  base: "gap-1 rounded-sm text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {},
  defaultVariants: {},
});

/** The name of a node. */
export const treeSelectNameStyle = defineSlotStyle({
  slot: "field-tree-name",
  base: "ml-0.5",
  variants: {},
  defaultVariants: {},
});

/** The check mark after the chosen node. */
export const treeSelectCheckStyle = defineSlotStyle({
  slot: "field-tree-check",
  base: "text-primary",
  variants: {},
  defaultVariants: {},
});

/** The checkbox and name of a cascading node. */
export const treeSelectCascadeStyle = defineSlotStyle({
  slot: "field-tree-cascade",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The selected value shown inside the trigger. */
export const treeSelectValueStyle = defineSlotStyle({
  slot: "field-tree-value",
  base: "",
  variants: {
    empty: { true: "text-muted-foreground", false: "" },
  },
  defaultVariants: { empty: false },
});

/** The box of a tree multi-select: chips and chevron inside one bordered control. */
export const treeMultiSelectBoxStyle = defineSlotStyle({
  slot: "field-tree-box",
  base: "gap-1 rounded-md border border-input bg-background px-3 py-1 text-sm focus-within:border-foreground",
  variants: {
    disabled: { true: "cursor-not-allowed opacity-50", false: "" },
    invalid: { true: "border-destructive focus-within:border-destructive", false: "" },
  },
  defaultVariants: { disabled: false, invalid: false },
});

/** The placeholder shown while nothing is chosen. */
export const treeMultiSelectPlaceholderStyle = defineSlotStyle({
  slot: "field-tree-placeholder",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The chevron button that opens a tree multi-select. */
export const treeMultiSelectOpenStyle = defineSlotStyle({
  slot: "field-tree-open",
  base: "rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {},
  defaultVariants: {},
});

/** The wrapper that pushes the check mark to the row's trailing edge. */
export const treeSelectCheckEndStyle = defineSlotStyle({
  slot: "field-tree-check-end",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});
