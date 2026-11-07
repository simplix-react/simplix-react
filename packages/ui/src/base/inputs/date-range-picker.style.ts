import { defineSlotStyle } from "../../design/slot-style";

/** The button that opens the range calendar. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const dateRangePickerTriggerStyle = defineSlotStyle({
  slot: "date-range-picker-trigger",
  base: "gap-2 rounded-md border border-input bg-background pl-3 text-sm font-normal focus-visible:outline-none disabled:opacity-50 data-[empty=true]:text-muted-foreground [&>svg:first-child]:opacity-50 focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    clearable: { true: "pr-9", false: "pr-3" },
  },
  defaultVariants: { clearable: false },
});

/** The text of the trigger: the picked range or the placeholder. */
export const dateRangePickerLabelStyle = defineSlotStyle({
  slot: "date-range-picker-label",
  base: "text-start",
  variants: {},
  defaultVariants: {},
});

/** The presets column beside the calendar. */
export const dateRangePickerPresetsStyle = defineSlotStyle({
  slot: "date-range-picker-presets",
  base: "border-r",
  variants: {},
  defaultVariants: {},
});

/** The presets column header. */
export const dateRangePickerPresetsHeaderStyle = defineSlotStyle({
  slot: "date-range-picker-presets-header",
  base: "px-3 pt-3 pb-2",
  variants: {},
  defaultVariants: {},
});

/** The presets column title. */
export const dateRangePickerPresetsTitleStyle = defineSlotStyle({
  slot: "date-range-picker-presets-title",
  base: "text-(length:--fs-label) leading-(--lh-label) font-semibold uppercase tracking-wider text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The scrolling list of preset groups. */
export const dateRangePickerPresetsListStyle = defineSlotStyle({
  slot: "date-range-picker-presets-list",
  base: "px-1.5 pb-2",
  variants: {},
  defaultVariants: {},
});

/** The line between preset groups. */
export const dateRangePickerPresetsDividerStyle = defineSlotStyle({
  slot: "date-range-picker-presets-divider",
  base: "border-t mx-1.5 my-1",
  variants: {},
  defaultVariants: {},
});

/** The two-column grid of one preset group. */
export const dateRangePickerPresetsGridStyle = defineSlotStyle({
  slot: "date-range-picker-presets-grid",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** One preset button. */
export const dateRangePickerPresetStyle = defineSlotStyle({
  slot: "date-range-picker-preset",
  base: "rounded-md px-2 py-1 text-xs text-start transition-colors",
  variants: {
    selected: {
      true: "bg-primary text-primary-foreground font-medium",
      false: "text-foreground hover:bg-accent",
    },
  },
  defaultVariants: { selected: false },
});

/** The calendar column. */
export const dateRangePickerAreaStyle = defineSlotStyle({
  slot: "date-range-picker-area",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});

/** The month/year navigation row. */
export const dateRangePickerNavStyle = defineSlotStyle({
  slot: "date-range-picker-nav",
  base: "gap-2 mb-2",
  variants: {},
  defaultVariants: {},
});

/** A previous or next month button. */
export const dateRangePickerNavButtonStyle = defineSlotStyle({
  slot: "date-range-picker-nav-button",
  base: "rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
  variants: {},
  defaultVariants: {},
});

/** The month and year dropdown pair of one calendar. */
export const dateRangePickerSelectsStyle = defineSlotStyle({
  slot: "date-range-picker-selects",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The start / end / day count summary strip. */
export const dateRangePickerSummaryStyle = defineSlotStyle({
  slot: "date-range-picker-summary",
  base: "mt-2 gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs",
  variants: {},
  defaultVariants: {},
});

/** A caption in the summary strip. */
export const dateRangePickerSummaryLabelStyle = defineSlotStyle({
  slot: "date-range-picker-summary-label",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A date value in the summary strip. */
export const dateRangePickerSummaryValueStyle = defineSlotStyle({
  slot: "date-range-picker-summary-value",
  base: "font-medium",
  variants: {},
  defaultVariants: {},
});

/** The day count badge in the summary strip. */
export const dateRangePickerSummaryCountStyle = defineSlotStyle({
  slot: "date-range-picker-summary-count",
  base: "rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary",
  variants: {},
  defaultVariants: {},
});

/** The row holding Today and the action buttons. */
export const dateRangePickerFooterStyle = defineSlotStyle({
  slot: "date-range-picker-footer",
  base: "gap-2 border-t pt-2 mt-2",
  variants: {},
  defaultVariants: {},
});

/** The Reset, Close and Select button group. */
export const dateRangePickerActionsStyle = defineSlotStyle({
  slot: "date-range-picker-actions",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** One footer button: outlined (Today, Reset, Close) or primary (Select). */
export const dateRangePickerActionStyle = defineSlotStyle({
  slot: "date-range-picker-action",
  base: "rounded-md text-xs",
  variants: {
    kind: {
      outline: "border border-input px-2 hover:bg-accent",
      primary: "bg-primary px-2.5 font-medium text-primary-foreground hover:bg-primary/90",
    },
  },
  defaultVariants: { kind: "outline" },
});

/** The button that clears the field. */
export const dateRangePickerClearStyle = defineSlotStyle({
  slot: "date-range-picker-clear",
  base: "z-2 rounded-sm p-0.5 transition-colors hover:bg-muted focus-visible:outline-none [&>svg]:opacity-50 [&>svg:hover]:opacity-100 focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});
