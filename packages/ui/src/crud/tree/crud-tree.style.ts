import { defineSlotStyle } from "../../design/slot-style";

/** The sort arrow beside a sortable column header; an unsorted column draws it faint. */
export const crudTreeSortIconStyle = defineSlotStyle({
  slot: "crud-tree-sort-icon",
  base: "ml-1",
  variants: { sorted: { true: "", false: "opacity-30" } },
  defaultVariants: { sorted: false },
});

/** The button a sortable column header is. */
export const crudTreeSortButtonStyle = defineSlotStyle({
  slot: "crud-tree-sort-button",
  base: "font-medium hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The bar above a tree: count, controls. */
export const crudTreeToolbarStyle = defineSlotStyle({
  slot: "crud-tree-toolbar",
  as: "part",
  base: "rounded-lg border bg-card p-2",
  variants: {},
  defaultVariants: {},
});

/** The group of controls pushed to the toolbar's far end. */
export const crudTreeToolbarControlsStyle = defineSlotStyle({
  slot: "crud-tree-toolbar-controls",
  as: "part",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});

/** The magnifier inside a search box. */
export const crudTreeSearchIconStyle = defineSlotStyle({
  slot: "crud-tree-search-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The button that clears a search box. */
export const crudTreeSearchClearStyle = defineSlotStyle({
  slot: "crud-tree-search-clear",
  base: "rounded-sm p-0.5 text-muted-foreground hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The expand-all and collapse-all group. */
export const crudTreeExpandToggleStyle = defineSlotStyle({
  slot: "crud-tree-expand-toggle",
  as: "part",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});

/** The chevron button that expands a branch; a leaf draws it invisible. */
export const crudTreeToggleStyle = defineSlotStyle({
  slot: "crud-tree-toggle",
  base: "rounded-sm",
  variants: {
    branch: {
      true: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      false: "text-transparent",
    },
  },
  defaultVariants: { branch: false },
});

/** The dot that stands in for the chevron on a leaf. */
export const crudTreeLeafDotStyle = defineSlotStyle({
  slot: "crud-tree-leaf-dot",
  base: "rounded-full bg-current opacity-30",
  variants: {},
  defaultVariants: {},
});

/** The name beside the chevron. */
export const crudTreeLabelStyle = defineSlotStyle({
  slot: "crud-tree-label",
  base: "ml-1",
  variants: {},
  defaultVariants: {},
});

/** The placeholder shown when a tree has no rows. */
export const crudTreeEmptyStyle = defineSlotStyle({
  slot: "crud-tree-empty",
  as: "part",
  base: "py-12",
  variants: {},
  defaultVariants: {},
});

/** The text of the empty placeholder. */
export const crudTreeEmptyTextStyle = defineSlotStyle({
  slot: "crud-tree-empty-text",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The search box in a tree toolbar, padded on the left for the magnifier. */
export const crudTreeSearchInputStyle = defineSlotStyle({
  slot: "crud-tree-search-input",
  as: "part",
  base: "pl-8",
  variants: {},
  defaultVariants: {},
});

/** A tree table row; the row of the open record is tinted. */
export const crudTreeRowStyle = defineSlotStyle({
  slot: "crud-tree-row",
  as: "part",
  base: "",
  variants: { active: { true: "bg-muted/50", false: "" } },
  defaultVariants: { active: false },
});

/** The popover that holds the compact search of a narrow tree toolbar. */
export const crudTreeSearchPopoverStyle = defineSlotStyle({
  slot: "crud-tree-search-popover",
  as: "part",
  base: "p-1",
  variants: {},
  defaultVariants: {},
});

/** The compact search box inside that popover. */
export const crudTreeSearchPopoverInputStyle = defineSlotStyle({
  slot: "crud-tree-search-popover-input",
  as: "part",
  base: "pl-7 pr-7 text-xs",
  variants: {},
  defaultVariants: {},
});
