import { defineSlotStyle } from "../../design/slot-style";

/** The row of top-level items. */
export const navigationMenuListStyle = defineSlotStyle({
  slot: "navigation-menu-list",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The button that opens a content panel. */
export const navigationMenuTriggerSlotStyle = defineSlotStyle({
  slot: "navigation-menu-trigger",
  base: "rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 outline-none",
  variants: {},
  defaultVariants: {},
});

/** The arrow of a trigger; it turns over while the panel is open. */
export const navigationMenuTriggerCaretStyle = defineSlotStyle({
  slot: "navigation-menu-trigger-caret",
  base: "ml-1 transition duration-300 group-data-[state=open]:rotate-180",
  variants: {},
  defaultVariants: {},
});

/** The panel a trigger opens. */
export const navigationMenuContentStyle = defineSlotStyle({
  slot: "navigation-menu-content",
  base: "p-2 pr-2.5 group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
  variants: {},
  defaultVariants: {},
});

/** The shared surface the open panels are drawn on. */
export const navigationMenuViewportStyle = defineSlotStyle({
  slot: "navigation-menu-viewport",
  base: "bg-popover text-popover-foreground mt-1.5 rounded-md border shadow",
  variants: {},
  defaultVariants: {},
});

/** A link inside a panel. */
export const navigationMenuLinkStyle = defineSlotStyle({
  slot: "navigation-menu-link",
  base: "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground gap-1 rounded-sm p-2 text-sm transition-all outline-none",
  variants: {},
  defaultVariants: {},
});

/** The marker that follows the hovered trigger. */
export const navigationMenuIndicatorStyle = defineSlotStyle({
  slot: "navigation-menu-indicator",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The arrow head drawn inside the indicator. */
export const navigationMenuIndicatorArrowStyle = defineSlotStyle({
  slot: "navigation-menu-indicator-arrow",
  base: "bg-border rounded-tl-sm shadow-md",
  variants: {},
  defaultVariants: {},
});
