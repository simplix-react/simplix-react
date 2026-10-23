import { defineSlotStyle } from "../../design/slot-style";

/** The dimmed backdrop behind a sheet. */
export const sheetOverlayStyle = defineSlotStyle({
  slot: "sheet-overlay",
  base: "bg-black/50",
  variants: {},
  defaultVariants: {},
});

/**
 * The sheet panel.
 *
 * `focus:outline-none` is on the container, and only on the container. Radix moves focus here
 * when the sheet opens, so the browser paints its focus ring around the whole panel, of which
 * only the edge nearest the page is on screen, which reads as a stray coloured line down the
 * side of the sheet rather than as focus. Nothing is lost by removing it: this element is a
 * region, not a control, and the first control inside still rings normally.
 */
export const sheetContentStyle = defineSlotStyle({
  slot: "sheet-content",
  base: "bg-background gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 focus:outline-none",
  variants: {
    side: {
      right: "border-l",
      left: "border-r",
      top: "border-b",
      bottom: "border-t",
    },
  },
  defaultVariants: { side: "right" },
});

/** The close button in the corner of a sheet. */
export const sheetCloseStyle = defineSlotStyle({
  slot: "sheet-close",
  base: "data-[state=open]:bg-secondary rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden",
  variants: {},
  defaultVariants: {},
});

/** The top block of a sheet. */
export const sheetHeaderStyle = defineSlotStyle({
  slot: "sheet-header",
  base: "gap-1.5 p-4",
  variants: {},
  defaultVariants: {},
});

/** The bottom block of a sheet, holding its actions. */
export const sheetFooterStyle = defineSlotStyle({
  slot: "sheet-footer",
  base: "mt-auto gap-2 p-4",
  variants: {},
  defaultVariants: {},
});

/** The sheet title. */
export const sheetTitleStyle = defineSlotStyle({
  slot: "sheet-title",
  base: "text-foreground font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The sheet description. */
export const sheetDescriptionStyle = defineSlotStyle({
  slot: "sheet-description",
  base: "text-muted-foreground text-sm",
  variants: {},
  defaultVariants: {},
});
