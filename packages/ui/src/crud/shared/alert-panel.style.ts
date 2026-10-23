import { defineSlotStyle } from "../../design/slot-style";

/** The dimmed layer behind an alert panel. */
export const alertPanelOverlayStyle = defineSlotStyle({
  slot: "alert-panel-overlay",
  base: "bg-black/50",
  variants: {},
  defaultVariants: {},
});

/** The centred panel. */
export const alertPanelContentStyle = defineSlotStyle({
  slot: "alert-panel-content",
  base: "rounded-lg border bg-background p-6 shadow-lg",
  variants: {},
  defaultVariants: {},
});

/** The heading pinned above the body. */
export const alertPanelTitleStyle = defineSlotStyle({
  slot: "alert-panel-title",
  base: "text-lg font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The scrolling body; it carries the panel's own horizontal padding so the scrollbar rides the panel edge. */
export const alertPanelBodyStyle = defineSlotStyle({
  slot: "alert-panel-body",
  base: "-mx-6 mt-2 px-6",
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
  base: "mt-6 gap-2",
  variants: {},
  defaultVariants: {},
});

/** The footer's secondary button, drawn on `AlertDialog.Cancel`. */
export const alertPanelCancelStyle = defineSlotStyle({
  slot: "alert-panel-cancel",
  base: "rounded-md px-4 text-sm font-medium border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The footer's committing button, drawn on `AlertDialog.Action`. */
export const alertPanelActionStyle = defineSlotStyle({
  slot: "alert-panel-action",
  base: "rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});
