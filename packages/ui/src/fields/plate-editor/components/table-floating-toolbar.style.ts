import { defineSlotStyle } from "../../../design/slot-style";

/** The floating table toolbar. */
export const plateTableToolbarStyle = defineSlotStyle({
  slot: "plate-table-toolbar",
  base: "gap-0.5 rounded-md border bg-background p-1 shadow-md",
  variants: {},
  defaultVariants: {},
});

/** A delete button: a part on the button, which carries its own slot. */
export const plateTableToolbarDangerStyle = defineSlotStyle({
  slot: "plate-table-toolbar-danger",
  as: "part",
  base: "text-destructive hover:text-destructive",
  variants: {},
  defaultVariants: {},
});

/** A button tooltip: a part on the tooltip content, which carries its own slot. */
export const plateTableToolbarTooltipStyle = defineSlotStyle({
  slot: "plate-table-toolbar-tooltip",
  as: "part",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/** A group separator: a part on the separator, which carries its own slot. */
export const plateTableToolbarSeparatorStyle = defineSlotStyle({
  slot: "plate-table-toolbar-separator",
  as: "part",
  base: "mx-0.5",
  variants: {},
  defaultVariants: {},
});
