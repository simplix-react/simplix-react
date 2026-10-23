import { defineSlotStyle } from "../../design/slot-style";

/** The check mark of the chosen parent. */
export const treeMoveCheckStyle = defineSlotStyle({
  slot: "tree-move-check",
  base: "text-primary",
  variants: {},
  defaultVariants: {},
});

/** The lock mark of a parent that cannot be chosen. */
export const treeMoveLockStyle = defineSlotStyle({
  slot: "tree-move-lock",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One row of the parent picker. */
export const treeMoveRowStyle = defineSlotStyle({
  slot: "tree-move-row",
  base: "gap-1 rounded-sm px-2 py-1.5 text-sm",
  variants: {
    selected: { true: "bg-accent text-accent-foreground", false: "" },
    interactive: { true: "hover:bg-accent/50", false: "" },
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { selected: false, interactive: false, disabled: false },
});

/** The button that expands or collapses a branch. */
export const treeMoveToggleStyle = defineSlotStyle({
  slot: "tree-move-toggle",
  base: "rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {
    branch: { true: "text-muted-foreground hover:text-foreground", false: "" },
  },
  defaultVariants: { branch: false },
});

/** The button that chooses a row as the new parent. */
export const treeMovePickStyle = defineSlotStyle({
  slot: "tree-move-pick",
  base: "gap-1 rounded-sm text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {},
  defaultVariants: {},
});

/** A row's name. */
export const treeMoveLabelStyle = defineSlotStyle({
  slot: "tree-move-label",
  base: "ml-1",
  variants: {},
  defaultVariants: {},
});

/** The mark pushed to a row's far end. */
export const treeMoveMarkerStyle = defineSlotStyle({
  slot: "tree-move-marker",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});

/** The scrolling box that holds the picker. */
export const treeMoveListStyle = defineSlotStyle({
  slot: "tree-move-list",
  base: "rounded-md border p-1",
  variants: {},
  defaultVariants: {},
});
