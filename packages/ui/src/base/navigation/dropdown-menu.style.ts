import { defineSlotStyle } from "../../design/slot-style";

/** The menu panel. */
export const dropdownMenuContentStyle = defineSlotStyle({
  slot: "dropdown-menu-content",
  base: "bg-popover text-popover-foreground rounded-[var(--radius-overlay)] border p-1 shadow-md duration-[var(--dur-base)] ease-[var(--ease-spring)] data-[state=closed]:ease-[var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** A plain menu item. */
export const dropdownMenuItemStyle = defineSlotStyle({
  slot: "dropdown-menu-item",
  base: "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled]:opacity-50 data-[inset]:pl-8",
  variants: {},
  defaultVariants: {},
});

/** A menu item with a check indicator. */
export const dropdownMenuCheckboxItemStyle = defineSlotStyle({
  slot: "dropdown-menu-checkbox-item",
  base: "focus:bg-accent focus:text-accent-foreground gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden data-[disabled]:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** A menu item with a radio indicator. */
export const dropdownMenuRadioItemStyle = defineSlotStyle({
  slot: "dropdown-menu-radio-item",
  base: "focus:bg-accent focus:text-accent-foreground gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden data-[disabled]:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The heading of a group of items. */
export const dropdownMenuLabelStyle = defineSlotStyle({
  slot: "dropdown-menu-label",
  base: "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
  variants: {},
  defaultVariants: {},
});

/** The line between groups of items. */
export const dropdownMenuSeparatorStyle = defineSlotStyle({
  slot: "dropdown-menu-separator",
  base: "bg-border -mx-1 my-1",
  variants: {},
  defaultVariants: {},
});

/** The item that opens a submenu. */
export const dropdownMenuSubTriggerStyle = defineSlotStyle({
  slot: "dropdown-menu-sub-trigger",
  base: "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[inset]:pl-8",
  variants: {},
  defaultVariants: {},
});

/** The arrow at the end of a submenu trigger. */
export const dropdownMenuSubTriggerCaretStyle = defineSlotStyle({
  slot: "dropdown-menu-sub-trigger-caret",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});

/** The submenu panel. */
export const dropdownMenuSubContentStyle = defineSlotStyle({
  slot: "dropdown-menu-sub-content",
  base: "bg-popover text-popover-foreground rounded-[var(--radius-overlay)] border p-1 shadow-lg duration-[var(--dur-base)] ease-[var(--ease-spring)] data-[state=closed]:ease-[var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** The dot marking the chosen radio item. */
export const dropdownMenuRadioIndicatorStyle = defineSlotStyle({
  slot: "dropdown-menu-radio-indicator",
  base: "fill-current",
  variants: {},
  defaultVariants: {},
});
