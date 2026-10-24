import { defineSlotStyle } from "../../../design/slot-style";

/** The focus ring every button of the time range selector draws. */
const FOCUS_RING = "focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]";

/** The selector card. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const timeRangeSelectorStyle = defineSlotStyle({
  slot: "time-range-selector",
  base: "rounded-lg border border-border bg-card",
  variants: {},
  defaultVariants: {},
});

/** The controls bar above the heatmap. */
export const timeRangeControlsStyle = defineSlotStyle({
  slot: "time-range-controls",
  base: "gap-2 px-2 pt-2 pb-1",
  variants: {},
  defaultVariants: {},
});

/** The window and calendar button groups. */
export const timeRangeControlsStartStyle = defineSlotStyle({
  slot: "time-range-controls-start",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The badge naming the shown range. It closes the group's right edge itself when nothing follows it, rather than leaning on a filler element to round the corner. */
export const timeRangeBadgeStyle = defineSlotStyle({
  slot: "time-range-badge",
  base: "rounded-l-md border border-input bg-muted/40 px-2 text-xs font-semibold tabular-nums",
  variants: {
    closed: { true: "rounded-r-md", false: "" },
  },
  defaultVariants: { closed: false },
});

/** One button of the window and calendar groups; the kind sets which corners are rounded. */
export const timeRangeActionStyle = defineSlotStyle({
  slot: "time-range-action",
  base: `border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${FOCUS_RING}`,
  variants: {
    kind: {
      expand: "border-y border-r",
      clear: "rounded-r-md border-y border-r",
      calendar: "rounded-l-md border",
      now: "rounded-r-md border-y border-r px-2 text-xs font-medium",
    },
  },
  defaultVariants: { kind: "expand" },
});

/** The from/to inputs inside the calendar popover. */
export const timeRangePopoverBodyStyle = defineSlotStyle({
  slot: "time-range-popover-body",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** The row holding the heatmap and its nav buttons. */
export const timeRangeHeatmapRowStyle = defineSlotStyle({
  slot: "time-range-heatmap-row",
  base: "gap-0 px-1",
  variants: {},
  defaultVariants: {},
});

/** The draggable heatmap surface. */
export const timeRangeHeatmapStyle = defineSlotStyle({
  slot: "time-range-heatmap",
  base: "transition-opacity rounded-sm focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    loading: { true: "opacity-50", false: "" },
  },
  defaultVariants: { loading: false },
});

/** The load-error overlay on the heatmap. */
export const timeRangeErrorStyle = defineSlotStyle({
  slot: "time-range-error",
  base: "gap-2 rounded-sm bg-card/85 text-xs text-muted-foreground [&>svg]:text-destructive",
  variants: {},
  defaultVariants: {},
});

/** The retry button in the error overlay. */
export const timeRangeRetryStyle = defineSlotStyle({
  slot: "time-range-retry",
  base: `rounded border border-input px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground transition-colors ${FOCUS_RING}`,
  variants: {},
  defaultVariants: {},
});

/** A previous or next window arrow. */
export const timeRangeNavButtonStyle = defineSlotStyle({
  slot: "time-range-nav-button",
  base: `rounded text-muted-foreground hover:text-foreground transition-colors ${FOCUS_RING}`,
  variants: {},
  defaultVariants: {},
});

/** The chip marking a custom window. */
export const timeRangeCustomChipStyle = defineSlotStyle({
  slot: "time-range-custom-chip",
  base: `gap-1 pl-2 pr-1 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground ${FOCUS_RING}`,
  variants: {},
  defaultVariants: {},
});

/** The clear glyph holder inside the custom chip. */
export const timeRangeCustomChipClearStyle = defineSlotStyle({
  slot: "time-range-custom-chip-clear",
  base: "rounded-sm hover:bg-primary-foreground/20",
  variants: {},
  defaultVariants: {},
});

/** The preset group, a row of buttons or a single select when narrow. */
export const timeRangePresetsStyle = defineSlotStyle({
  slot: "time-range-presets",
  base: "",
  variants: {
    layout: { row: "gap-px", compact: "gap-1" },
  },
  defaultVariants: { layout: "row" },
});

/** The preset select shown when the bar is narrow. */
export const timeRangePresetSelectStyle = defineSlotStyle({
  slot: "time-range-preset-select",
  base: `rounded border border-input bg-background px-1 text-xs font-medium text-muted-foreground ${FOCUS_RING}`,
  variants: {},
  defaultVariants: {},
});

/** One preset button. */
export const timeRangePresetStyle = defineSlotStyle({
  slot: "time-range-preset",
  base: `px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${FOCUS_RING}`,
  variants: {
    active: {
      true: "bg-primary text-primary-foreground",
      false: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    },
  },
  defaultVariants: { active: false },
});

/** The dashed frame of the selected span and of the live drag preview. */
export const timeRangeSelectionBoxStyle = defineSlotStyle({
  slot: "time-range-selection-box",
  base: "rounded-[2px]",
  variants: {},
  defaultVariants: {},
});

/** The vertical line of the current-time indicator. */
export const timeRangeNowLineStyle = defineSlotStyle({
  slot: "time-range-now-line",
  base: "bg-destructive/60",
  variants: {},
  defaultVariants: {},
});

/** The arrow above the hover tooltip. */
export const timeRangeTooltipArrowStyle = defineSlotStyle({
  slot: "time-range-tooltip-arrow",
  base: "-mb-[1px] text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The hover tooltip box. */
export const timeRangeTooltipStyle = defineSlotStyle({
  slot: "time-range-tooltip",
  base: "rounded-md bg-foreground px-2 py-0.5 text-xs text-background shadow-md",
  variants: {},
  defaultVariants: {},
});

/** The count in the hover tooltip. */
export const timeRangeTooltipCountStyle = defineSlotStyle({
  slot: "time-range-tooltip-count",
  base: "font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The row of time axis labels. */
export const timeRangeLabelsStyle = defineSlotStyle({
  slot: "time-range-labels",
  base: "mx-7 mb-2",
  variants: {},
  defaultVariants: {},
});

/** One time axis label. */
export const timeRangeLabelStyle = defineSlotStyle({
  slot: "time-range-label",
  base: "text-[11px] text-muted-foreground tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** A labelled date and time input. */
export const timeRangeFieldStyle = defineSlotStyle({
  slot: "time-range-field",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The label of a date and time input. */
export const timeRangeFieldLabelStyle = defineSlotStyle({
  slot: "time-range-field-label",
  base: "text-xs font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The date picker and time boxes of one input. */
export const timeRangeFieldRowStyle = defineSlotStyle({
  slot: "time-range-field-row",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The hour and minute boxes. */
export const timeRangeFieldTimeStyle = defineSlotStyle({
  slot: "time-range-field-time",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** An hour or minute box. */
export const timeRangeFieldInputStyle = defineSlotStyle({
  slot: "time-range-field-input",
  base: `rounded-md border border-input bg-background px-1 text-center text-xs ${FOCUS_RING}`,
  variants: {},
  defaultVariants: {},
});

/** The colon between hour and minute. */
export const timeRangeFieldColonStyle = defineSlotStyle({
  slot: "time-range-field-colon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The from / to popover panel: a part on the popover content, which carries its own slot. */
export const timeRangePopoverStyle = defineSlotStyle({
  slot: "time-range-popover",
  as: "part",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});
