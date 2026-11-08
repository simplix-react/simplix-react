import { defineSlotStyle } from "../../design/slot-style";

/** The toolbar row itself, which holds the leading and the trailing group: inset and ruled off from the table under it. */
export const crudFilterBarStyle = defineSlotStyle({
  slot: "crud-filter-bar",
  as: "part",
  base: "gap-2 border-b px-3 py-2.5",
  variants: {},
  defaultVariants: {},
});

/**
 * The group at the start of the toolbar: count, caller content, view toggle and preview button.
 *
 * <p>The preview button is the shared `Button`, whose own slot is fixed, so what the bar changes
 * about it is written as a rule here against the button marked `data-preview`.
 */
export const crudFilterBarLeadingStyle = defineSlotStyle({
  slot: "crud-filter-bar-leading",
  base: "gap-2 [&>[data-preview]]:gap-1.5 [&>[data-preview]]:font-semibold",
  variants: {},
  defaultVariants: {},
});

/**
 * The group at the end of the toolbar: active-filter chips, caller content and the filter trigger.
 *
 * <p>`ml-auto` rather than the row's `justify`: `justify-between` only reaches the first line, so
 * once the row wraps this group lands at the START of the second one, and the search button slides
 * under the count instead of staying at the end of the toolbar. An auto margin moves it to the far
 * edge of whichever line it is on.
 *
 * <p>The chips are the shared `Badge`, whose own slot is fixed, so what the bar changes about them
 * is written as rules here against the badges marked `data-filter-chip` and `data-filter-more`.
 */
export const crudFilterBarTrailingStyle = defineSlotStyle({
  slot: "crud-filter-bar-trailing",
  base: "ml-auto gap-2 [&>[data-filter-chip]]:gap-1 [&>[data-filter-chip]]:rounded-md [&>[data-filter-chip]]:border-input [&>[data-filter-chip]]:pl-2 [&>[data-filter-chip]]:pr-1 [&>[data-filter-chip]]:text-xs [&>[data-filter-chip]]:font-normal [&>[data-filter-chip]>svg]:text-muted-foreground [&>[data-filter-chip]>span:first-child]:text-muted-foreground [&>[data-filter-more]]:rounded-md [&>[data-filter-more]]:border-input [&>[data-filter-more]]:px-2 [&>[data-filter-more]]:text-xs [&>[data-filter-more]]:font-normal",
  variants: {},
  defaultVariants: {},
});

/** The remove button inside an active-filter chip. */
export const crudFilterBarChipRemoveStyle = defineSlotStyle({
  slot: "crud-filter-bar-chip-remove",
  base: "ml-0.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** A bordered group of toolbar buttons (the view toggle, the filter trigger with the columns toggle). */
export const crudFilterBarSegmentStyle = defineSlotStyle({
  slot: "crud-filter-bar-segment",
  base: "[--focus-halo:var(--focus-halo-inset)] rounded-md border border-input bg-card p-0.5",
  variants: {
    spaced: { true: "gap-0.5", false: "" },
  },
  defaultVariants: { spaced: false },
});

/** One button of the list/grid view toggle. */
export const crudFilterBarViewButtonStyle = defineSlotStyle({
  slot: "crud-filter-bar-view-button",
  base: "rounded transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    active: {
      true: "bg-muted text-foreground",
      false: "text-muted-foreground hover:text-foreground",
    },
  },
  defaultVariants: { active: false },
});

/**
 * The button that opens the filter popover.
 *
 * <p>The count badge inside is the shared `Badge`, whose own slot is fixed, so how it is drawn here
 * is written as a rule against it.
 */
export const crudFilterBarTriggerStyle = defineSlotStyle({
  slot: "crud-filter-bar-trigger",
  base: "gap-1.5 rounded px-2 text-sm transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] hover:bg-muted [&>[data-slot=badge]]:rounded-full [&>[data-slot=badge]]:bg-primary [&>[data-slot=badge]]:px-1 [&>[data-slot=badge]]:text-(length:--fs-2xs) [&>[data-slot=badge]]:font-bold [&>[data-slot=badge]]:leading-none [&>[data-slot=badge]]:text-primary-foreground",
  variants: {
    active: {
      true: "text-primary",
      false: "text-muted-foreground hover:text-foreground",
    },
  },
  defaultVariants: { active: false },
});

/**
 * The button that removes every active filter at once. It stands in the trigger's segment, right
 * after the trigger, and is drawn only while a filter is active.
 */
export const crudFilterBarClearButtonStyle = defineSlotStyle({
  slot: "crud-filter-bar-clear-button",
  base: "rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The button that opens the column-visibility menu. */
export const crudFilterBarColumnsButtonStyle = defineSlotStyle({
  slot: "crud-filter-bar-columns-button",
  base: "rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/**
 * The title row of the filter popover, with the clear and apply buttons.
 *
 * <p>The buttons are the shared `Button`, whose own slot is fixed, so their padding and size of
 * text are written as rules against them.
 */
export const crudFilterBarPopoverHeaderStyle = defineSlotStyle({
  slot: "crud-filter-bar-popover-header",
  base: "gap-4 border-b px-4 py-2.5 [&>span]:text-sm [&>span]:font-bold [&_[data-slot=button]]:text-xs [&_[data-slot=button][data-variant=ghost]]:px-2 [&_[data-slot=button][data-variant=default]]:px-3",
  variants: {},
  defaultVariants: {},
});

/** The scrolling area of the filter popover that holds the fields. */
export const crudFilterBarFieldsStyle = defineSlotStyle({
  slot: "crud-filter-bar-fields",
  base: "p-4",
  variants: {},
  defaultVariants: {},
});

/** One column of fields in the filter popover; the fields in it are spaced apart. */
export const crudFilterBarColumnStyle = defineSlotStyle({
  slot: "crud-filter-bar-column",
  base: "[&>*+*]:mt-4",
  variants: {},
  defaultVariants: {},
});

/**
 * The filter trigger's word. A design that draws the trigger icon-only hides it from sight and
 * keeps the trigger's accessible name and tooltip.
 */
export const crudFilterBarTriggerLabelStyle = defineSlotStyle({
  slot: "crud-filter-bar-trigger-label",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** A vertical rule between columns or between the buttons of a segment. */
export const crudFilterBarDividerStyle = defineSlotStyle({
  slot: "crud-filter-bar-divider",
  // The filter and column controls stand apart by their gap, without a rule between them.
  base: "!hidden bg-border",
  variants: {
    inset: { true: "mx-0.5", false: "" },
  },
  defaultVariants: { inset: false },
});

/**
 * One field of the filter popover: a caption row above its control.
 *
 * <p>The caption is the shared `Label`, whose own slot is fixed, so its look is written as a rule
 * against it.
 */
export const crudFilterBarFieldStyle = defineSlotStyle({
  slot: "crud-filter-bar-field",
  base: "gap-1 [&>div>label]:text-sm [&>div>label]:font-medium [&>div>label]:text-secondary-foreground",
  variants: {},
  defaultVariants: {},
});

/**
 * The row of a field that pairs an operator selector with the value control.
 *
 * <p>Both controls are the shared `Select` trigger and `Input`, whose own slots are fixed, so what
 * the row changes about them is written as rules here: the first button is the operator selector,
 * the control after it takes the remaining width.
 */
export const crudFilterBarOperatorRowStyle = defineSlotStyle({
  slot: "crud-filter-bar-operator-row",
  base: "gap-1 [&>button:first-child]:border [&>button:first-child]:bg-muted/50 [&>button:first-child]:px-0 [&>button:first-child]:text-muted-foreground [&>button:nth-child(2)]:text-sm [&>input]:text-sm",
  variants: {},
  defaultVariants: {},
});

/** An entry of the operator selector: its icon beside its name. */
export const crudFilterBarOperatorOptionStyle = defineSlotStyle({
  slot: "crud-filter-bar-operator-option",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The name of an operator in the operator selector. */
export const crudFilterBarOperatorLabelStyle = defineSlotStyle({
  slot: "crud-filter-bar-operator-label",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/**
 * The option list of a faceted field.
 *
 * <p>The list is the shared `Command`, whose own slot is fixed, so its corners and border are
 * written as rules against it. A list inside a dropdown has no border of its own.
 */
export const crudFilterBarOptionsStyle = defineSlotStyle({
  slot: "crud-filter-bar-options",
  base: "[&>[cmdk-root]]:rounded-md",
  variants: {
    bordered: { true: "[&>[cmdk-root]]:border", false: "" },
  },
  defaultVariants: { bordered: true },
});

/** The notice shown in place of the options while they load. */
export const crudFilterBarOptionsLoadingStyle = defineSlotStyle({
  slot: "crud-filter-bar-options-loading",
  base: "gap-2 py-6 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The notice shown when a faceted field has nothing to pick. */
export const crudFilterBarNoOptionsStyle = defineSlotStyle({
  slot: "crud-filter-bar-no-options",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The button that opens the option list of a dropdown-style faceted field. */
export const crudFilterBarDropdownTriggerStyle = defineSlotStyle({
  slot: "crud-filter-bar-dropdown-trigger",
  base: "gap-1 rounded-md border border-input bg-background px-3 text-sm focus:border-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The chosen labels (or the prompt) inside the dropdown trigger. */
export const crudFilterBarDropdownValueStyle = defineSlotStyle({
  slot: "crud-filter-bar-dropdown-value",
  base: "text-left",
  variants: {
    empty: { true: "text-muted-foreground", false: "" },
  },
  defaultVariants: { empty: false },
});

/**
 * A toggle field: its caption, a leader line and the switch on one row.
 *
 * <p>The caption is the shared `Label`, whose own slot is fixed, so its look is written as a rule
 * against it.
 */
export const crudFilterBarToggleFieldStyle = defineSlotStyle({
  slot: "crud-filter-bar-toggle-field",
  base: "gap-2 py-1 [&>label]:text-sm [&>label]:font-medium [&>label]:text-secondary-foreground",
  variants: {},
  defaultVariants: {},
});

/** The dashed line between a toggle's caption and its switch. */
export const crudFilterBarToggleLeaderStyle = defineSlotStyle({
  slot: "crud-filter-bar-toggle-leader",
  base: "border-b border-dashed border-border",
  variants: {},
  defaultVariants: {},
});

/** The chosen range, written beside the clear button of a date-range field. */
export const crudFilterBarRangeTextStyle = defineSlotStyle({
  slot: "crud-filter-bar-range-text",
  base: "text-xs text-foreground",
  variants: {},
  defaultVariants: {},
});

/**
 * The frame around the inline calendar of a date-range field.
 *
 * <p>The calendar is the shared `Calendar`, whose own slot is fixed, so how it fits the popover
 * (padding, smaller day cells and header) is written as rules against its parts.
 */
export const crudFilterBarCalendarStyle = defineSlotStyle({
  slot: "crud-filter-bar-calendar",
  base: "rounded-md border [&>div]:p-2 [&_div.grid>button]:text-xs [&_nav]:pb-1",
  variants: {},
  defaultVariants: {},
});
