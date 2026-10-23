import { defineSlotStyle } from "../../design/slot-style";

/** The bordered frame around the map preview and around the dialog map. */
export const detailLocationFieldFrameStyle = defineSlotStyle({
  slot: "detail-location-field-frame",
  base: "rounded-md border",
  variants: {},
  defaultVariants: {},
});

/** The strip above the preview that holds the coordinates and the open button. */
export const detailLocationFieldHeaderStyle = defineSlotStyle({
  slot: "detail-location-field-header",
  base: "border-b py-0.5 pl-3 pr-0.5",
  variants: {},
  defaultVariants: {},
});

/** The coordinate text in the preview strip. */
export const detailLocationFieldCoordinatesStyle = defineSlotStyle({
  slot: "detail-location-field-coordinates",
  base: "text-muted-foreground text-sm tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The button in the preview strip that opens the map dialog. */
export const detailLocationFieldOpenStyle = defineSlotStyle({
  slot: "detail-location-field-open",
  base: "gap-1.5 rounded-md border border-input px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
  variants: {},
  defaultVariants: {},
});

/** The button that wraps the map preview. */
export const detailLocationFieldPreviewButtonStyle = defineSlotStyle({
  slot: "detail-location-field-preview-button",
  base: "transition-opacity hover:opacity-90",
  variants: {},
  defaultVariants: {},
});

/** The backdrop behind the map preview. */
export const detailLocationFieldPreviewStyle = defineSlotStyle({
  slot: "detail-location-field-preview",
  base: "bg-neutral-100 dark:bg-neutral-900",
  variants: {},
  defaultVariants: {},
});

/** The row of map controls at the bottom left of the dialog map. */
export const detailLocationFieldControlsStyle = defineSlotStyle({
  slot: "detail-location-field-controls",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The fly-back button over the dialog map. */
export const detailLocationFieldFlyBackStyle = defineSlotStyle({
  slot: "detail-location-field-fly-back",
  base: "rounded-md border border-black/10 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
  variants: {},
  defaultVariants: {},
});

/** The frame around the light and dark theme buttons. */
export const detailLocationFieldThemeGroupStyle = defineSlotStyle({
  slot: "detail-location-field-theme-group",
  base: "rounded-md border border-black/10 shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** One theme button; `state` is the button's theme and whether it is the one in force. */
export const detailLocationFieldThemeButtonStyle = defineSlotStyle({
  slot: "detail-location-field-theme-button",
  base: "transition-colors",
  variants: {
    state: {
      "light-on": "bg-white text-neutral-800",
      "light-off": "bg-black/40 text-white/70 hover:text-white",
      "dark-on": "bg-neutral-800 text-white",
      "dark-off": "bg-white/80 text-neutral-400 hover:text-neutral-600",
    },
  },
  defaultVariants: {},
});

/** The coordinate label at the bottom right of the dialog map. */
export const detailLocationFieldCoordinatesBadgeStyle = defineSlotStyle({
  slot: "detail-location-field-coordinates-badge",
  base: "rounded-md bg-black/60 px-2.5 py-1.5 text-sm tabular-nums text-white shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** Classes of the dialog map, which renders its own element and takes only a `className`. */
export const detailLocationMapBackground = {
  dark: "bg-neutral-900",
  light: "bg-neutral-100",
} as const;
