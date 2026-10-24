import { defineSlotStyle } from "../../design/slot-style";

/** The dimmed layer behind an alert panel. */
export const alertPanelOverlayStyle = defineSlotStyle({
  slot: "alert-panel-overlay",
  base: "bg-black/50 duration-[var(--dur-slow)] data-[state=closed]:duration-[var(--dur-base)]",
  variants: {},
  defaultVariants: {},
});

/**
 * The centred panel.
 *
 * `outline-none` is on the container, and only on the container. Radix moves focus here when the
 * panel opens; a ring around the whole panel reads as a border, not as focus. The buttons inside
 * still show the focus halo.
 */
export const alertPanelContentStyle = defineSlotStyle({
  slot: "alert-panel-content",
  base: "rounded-[var(--radius-overlay)] border bg-background p-0 shadow-lg outline-none duration-[var(--dur-slow)] ease-[var(--ease-spring)] data-[state=closed]:duration-[var(--dur-base)] data-[state=closed]:ease-[var(--ease)] sm:data-[state=open]:[--tw-enter-scale:0.97]! sm:data-[state=open]:[--tw-enter-translate-y:8px]! sm:data-[state=closed]:[--tw-exit-scale:0.98]!",
  variants: {},
  defaultVariants: {},
});

/** The heading pinned above the body. */
export const alertPanelTitleStyle = defineSlotStyle({
  slot: "alert-panel-title",
  base: "px-5 pt-5 pb-4 text-lg leading-6 font-semibold border-b transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    /** The body below is scrolled: content passes under the title band. */
    scrolled: { true: "shadow-[0_8px_12px_-12px_rgb(0_0_0/0.35)]", false: "" },
    /** A body follows the title. */
    body: { true: "", false: "border-b-0 pb-5" },
  },
  defaultVariants: { scrolled: false, body: false },
});

/** The scrolling body, carrying the shared 20px inset. */
export const alertPanelBodyStyle = defineSlotStyle({
  slot: "alert-panel-body",
  base: "p-5",
  variants: {},
  defaultVariants: {},
});

/** The description text. */
export const alertPanelDescriptionStyle = defineSlotStyle({
  slot: "alert-panel-description",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The footer row of buttons. */
export const alertPanelFooterStyle = defineSlotStyle({
  slot: "alert-panel-footer",
  base: "gap-2 px-5 py-3 border-t bg-muted/50 rounded-b-[inherit] transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    /** More of the body lies below: content passes under the footer. */
    overflow: { true: "shadow-[0_-8px_12px_-12px_rgb(0_0_0/0.35)]", false: "" },
  },
  defaultVariants: { overflow: false },
});

/** The footer's secondary button, drawn on `AlertDialog.Cancel`. */
export const alertPanelCancelStyle = defineSlotStyle({
  slot: "alert-panel-cancel",
  base: "rounded-md px-3 text-sm font-medium active:scale-[0.98] border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The footer's committing button, drawn on `AlertDialog.Action`. */
export const alertPanelActionStyle = defineSlotStyle({
  slot: "alert-panel-action",
  base: "rounded-md px-3 text-sm font-medium active:scale-[0.98] bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    /** `danger` commits something that destroys or discards. */
    tone: {
      primary: "",
      danger: "bg-destructive text-white hover:bg-destructive/90 focus-visible:shadow-[var(--invalid-halo)] focus-visible:outline-none",
    },
  },
  defaultVariants: { tone: "primary" },
});
