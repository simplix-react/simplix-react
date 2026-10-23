import { defineSlotStyle } from "../../design/slot-style";

/** The dimmed backdrop behind a dialog. */
export const dialogOverlayStyle = defineSlotStyle({
  slot: "dialog-overlay",
  base: "bg-black/50",
  variants: {},
  defaultVariants: {},
});

/**
 * The dialog panel.
 *
 * `outline-none` is on the container, and only on the container. Radix moves focus here when the
 * dialog opens; a ring around the whole panel reads as a border, not as focus. The first control
 * inside still rings normally.
 */
export const dialogContentStyle = defineSlotStyle({
  slot: "dialog-content",
  base: "bg-background gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none",
  variants: {
    /** Drops the panel padding, for a body that draws its own. */
    flush: { true: "p-0", false: "" },
  },
  defaultVariants: { flush: false },
});

/** The maximize and close icon buttons in the top-right corner, drawn as one group. */
export const dialogCornerButtonStyle = defineSlotStyle({
  slot: "dialog-corner-button",
  base: "rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden",
  variants: {
    /** The close button also marks itself while its dialog is open. */
    close: {
      true: "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
      false: "",
    },
  },
  defaultVariants: { close: false },
});

/** The row holding the corner buttons. */
export const dialogCornerActionsStyle = defineSlotStyle({
  slot: "dialog-corner-actions",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** The top block of a dialog. */
export const dialogHeaderStyle = defineSlotStyle({
  slot: "dialog-header",
  base: "gap-2 text-center sm:text-left",
  variants: {},
  defaultVariants: {},
});

/** The bottom block of a dialog, holding its actions. */
export const dialogFooterStyle = defineSlotStyle({
  slot: "dialog-footer",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The dialog title. */
export const dialogTitleStyle = defineSlotStyle({
  slot: "dialog-title",
  base: "text-lg leading-none font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The dialog description. */
export const dialogDescriptionStyle = defineSlotStyle({
  slot: "dialog-description",
  base: "text-muted-foreground text-sm",
  variants: {},
  defaultVariants: {},
});
