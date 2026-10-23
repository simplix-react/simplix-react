import { defineSlotStyle } from "../../design/slot-style";

/** The bordered card holding the location summary and the map preview, and the dialog's map frame. */
export const locationCardStyle = defineSlotStyle({
  slot: "field-location-card",
  base: "rounded-md border",
  variants: {},
  defaultVariants: {},
});

/** The summary row above the map preview. */
export const locationHeaderStyle = defineSlotStyle({
  slot: "field-location-header",
  base: "border-b py-0.5 pl-3 pr-0.5",
  variants: {},
  defaultVariants: {},
});

/** The coordinates text in the summary row. */
export const locationCoordsStyle = defineSlotStyle({
  slot: "field-location-coords",
  base: "text-muted-foreground text-sm tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The buttons at the trailing edge of the summary row. */
export const locationActionsStyle = defineSlotStyle({
  slot: "field-location-actions",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** The icon-only button that clears the location. */
export const locationClearStyle = defineSlotStyle({
  slot: "field-location-clear",
  base: "rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The bordered button that opens the map from the summary row. */
export const locationOpenStyle = defineSlotStyle({
  slot: "field-location-open",
  base: "gap-1.5 rounded-md border border-input px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The button wrapping the map preview. */
export const locationPreviewButtonStyle = defineSlotStyle({
  slot: "field-location-preview-button",
  base: "transition-opacity hover:opacity-90 disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The map preview's backdrop. */
export const locationPreviewStyle = defineSlotStyle({
  slot: "field-location-preview",
  base: "bg-neutral-100 dark:bg-neutral-900",
  variants: {},
  defaultVariants: {},
});

/** The button that asks for a location while none is chosen. */
export const locationPromptStyle = defineSlotStyle({
  slot: "field-location-prompt",
  base: "rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** A row of controls: coordinate inputs, or the search box and locate button. */
export const locationRowStyle = defineSlotStyle({
  slot: "field-location-row",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The disabled map button shown when the map cannot load. */
export const locationUnavailableStyle = defineSlotStyle({
  slot: "field-location-unavailable",
  base: "rounded-md border border-input bg-background text-muted-foreground opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The button that locates the user. */
export const locationLocateStyle = defineSlotStyle({
  slot: "field-location-locate",
  base: "rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The locate icon, pulsing while the position is being read. */
export const locationLocateIconStyle = defineSlotStyle({
  slot: "field-location-locate-icon",
  base: "",
  variants: {
    locating: { true: "animate-pulse", false: "" },
  },
  defaultVariants: { locating: false },
});

/** The dialog map: a part on the map container, which the map component renders. */
export const locationMapStyle = defineSlotStyle({
  slot: "field-location-map",
  as: "part",
  base: "",
  variants: {
    theme: { dark: "bg-neutral-900", light: "bg-neutral-100" },
  },
  defaultVariants: { theme: "light" },
});

/** The light / dark toggle laid over the map. */
export const locationThemeToggleStyle = defineSlotStyle({
  slot: "field-location-theme-toggle",
  base: "rounded-md border border-black/10 shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** One button of the theme toggle; `state` is the button's theme and whether it is the active one. */
export const locationThemeButtonStyle = defineSlotStyle({
  slot: "field-location-theme-button",
  base: "transition-colors",
  variants: {
    state: {
      "light-active": "bg-white text-neutral-800",
      "light-idle": "bg-black/40 text-white/70 hover:text-white",
      "dark-active": "bg-neutral-800 text-white",
      "dark-idle": "bg-white/80 text-neutral-400 hover:text-neutral-600",
    },
  },
  defaultVariants: { state: "light-active" },
});

/** The coordinates readout laid over the map. */
export const locationReadoutStyle = defineSlotStyle({
  slot: "field-location-readout",
  base: "rounded-md bg-black/60 px-2.5 py-1.5 text-sm tabular-nums text-white shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** The magnifying glass in the search box. */
export const locationSearchIconStyle = defineSlotStyle({
  slot: "field-location-search-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The search input: a part on the input, which carries its own slot. */
export const locationSearchInputStyle = defineSlotStyle({
  slot: "field-location-search-input",
  as: "part",
  base: "pl-8",
  variants: {},
  defaultVariants: {},
});

/** The list of search results. */
export const locationResultsStyle = defineSlotStyle({
  slot: "field-location-results",
  base: "mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
  variants: {},
  defaultVariants: {},
});

/** One search result button. */
export const locationResultStyle = defineSlotStyle({
  slot: "field-location-result",
  base: "rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
  variants: {},
  defaultVariants: {},
});

/** The result's address text. */
export const locationResultTextStyle = defineSlotStyle({
  slot: "field-location-result-text",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});
