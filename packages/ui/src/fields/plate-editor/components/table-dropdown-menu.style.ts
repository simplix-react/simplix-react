import { defineSlotStyle } from "../../../design/slot-style";

/** A menu glyph; the lucide icon writes no slot of its own. */
export const plateTableMenuIconStyle = defineSlotStyle({
  slot: "plate-table-menu-icon",
  base: "mr-2",
  variants: {},
  defaultVariants: {},
});

/** A destructive menu item: a part on the menu item, which carries its own slot. */
export const plateTableMenuDangerStyle = defineSlotStyle({
  slot: "plate-table-menu-danger",
  as: "part",
  base: "text-destructive",
  variants: {},
  defaultVariants: {},
});

/** The grid picker submenu: a part on the submenu content, which carries its own slot. */
export const plateTableMenuGridStyle = defineSlotStyle({
  slot: "plate-table-menu-grid",
  as: "part",
  base: "p-0",
  variants: {},
  defaultVariants: {},
});
