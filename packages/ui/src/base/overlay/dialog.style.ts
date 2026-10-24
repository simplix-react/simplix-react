import { defineSlotStyle } from "../../design/slot-style";

/** The dimmed backdrop behind a dialog. */
export const dialogOverlayStyle = defineSlotStyle({
  slot: "dialog-overlay",
  base: "bg-black/50 duration-[var(--dur-slow)] data-[state=closed]:duration-[var(--dur-base)]",
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
  base: "bg-background gap-4 rounded-[var(--radius-overlay)] border p-6 shadow-lg outline-none duration-[var(--dur-slow)] ease-[var(--ease-spring)] data-[state=closed]:duration-[var(--dur-base)] data-[state=closed]:ease-[var(--ease)] sm:data-[state=open]:[--tw-enter-scale:0.97]! sm:data-[state=open]:[--tw-enter-translate-y:8px]! sm:data-[state=closed]:[--tw-exit-scale:0.98]!",
  variants: {
    /** Drops the panel padding, for a body that draws its own. */
    flush: { true: "p-0", false: "" },
    /** Laid out as header, scrolling body and footer bands (see `DialogContent`). */
    banded: { true: "gap-0 p-0", false: "" },
  },
  defaultVariants: { flush: false, banded: false },
});

/** The maximize and close icon buttons in the top-right corner, drawn as one group. */
export const dialogCornerButtonStyle = defineSlotStyle({
  slot: "dialog-corner-button",
  base: "size-8 inline-grid place-items-center rounded-md opacity-70 transition-[opacity,background-color,transform] duration-[var(--dur-fast)] hover:opacity-100 hover:bg-accent active:scale-[0.98] focus:outline-hidden focus-visible:shadow-[var(--focus-halo)]",
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
  base: "top-4 right-4 gap-1",
  variants: {},
  defaultVariants: {},
});

/** The top block of a dialog. */
export const dialogHeaderStyle = defineSlotStyle({
  slot: "dialog-header",
  base: "gap-1 text-left px-5 pt-5 pb-4 pe-14 border-b transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    /** The body below is scrolled: content passes under the header. */
    scrolled: { true: "shadow-[0_8px_12px_-12px_rgb(0_0_0/0.35)]", false: "" },
    /** A corner button sits over the header's end. */
    corner: { true: "", false: "pe-5" },
  },
  defaultVariants: { scrolled: false, corner: true },
});

/** The scrolling middle of a banded dialog, carrying the shared 20px inset. */
export const dialogBodyStyle = defineSlotStyle({
  slot: "dialog-body",
  base: "grid content-start gap-4 p-5",
  variants: {
    /** A header band sits above the body. */
    head: { true: "", false: "" },
    /** A footer band sits below the body. */
    foot: { true: "", false: "" },
  },
  defaultVariants: { head: false, foot: false },
});

/** The bottom block of a dialog, holding its actions. */
export const dialogFooterStyle = defineSlotStyle({
  slot: "dialog-footer",
  base: "gap-2 px-5 py-3 border-t bg-muted/50 rounded-b-[inherit] transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    /** More of the body lies below: content passes under the footer. */
    overflow: { true: "shadow-[0_-8px_12px_-12px_rgb(0_0_0/0.35)]", false: "" },
  },
  defaultVariants: { overflow: false },
});

/** The dialog title. */
export const dialogTitleStyle = defineSlotStyle({
  slot: "dialog-title",
  base: "text-lg leading-6 font-semibold",
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
