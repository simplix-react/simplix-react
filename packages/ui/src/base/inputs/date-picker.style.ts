import { defineSlotStyle } from "../../design/slot-style";

/**
 * The date picker's outer wrapper.
 *
 * <p>`joined` draws the field as the middle segment of a button group (the date navigator sets it).
 */
export const datePickerStyle = defineSlotStyle({
  slot: "date-picker",
  base: "",
  variants: {
    joined: {
      none: "",
      sm: "-ml-px rounded-none border-input text-xs px-2",
      default: "-ml-px rounded-none border-input text-sm",
    },
  },
  defaultVariants: { joined: "none" },
});

/** The button that opens the calendar. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const datePickerTriggerStyle = defineSlotStyle({
  slot: "date-picker-trigger",
  base: "gap-2 rounded-md border border-input bg-background pl-3 text-sm font-normal focus-visible:outline-none disabled:opacity-50 data-[empty=true]:text-muted-foreground [&>svg:first-child]:opacity-50 focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    clearable: { true: "pr-9", false: "pr-3" },
  },
  defaultVariants: { clearable: false },
});

/** The text of the trigger: the picked date or the placeholder. */
export const datePickerLabelStyle = defineSlotStyle({
  slot: "date-picker-label",
  base: "text-start",
  variants: {},
  defaultVariants: {},
});

/** The popover body around the calendar. */
export const datePickerPanelStyle = defineSlotStyle({
  slot: "date-picker-panel",
  base: "p-3 [&>[data-slot=time-select-control]]:mt-2",
  variants: {},
  defaultVariants: {},
});

/** The month/year navigation row. */
export const datePickerHeaderStyle = defineSlotStyle({
  slot: "date-picker-header",
  base: "mb-2 gap-3",
  variants: {},
  defaultVariants: {},
});

/** The row between the previous and next month buttons. */
export const datePickerNavStyle = defineSlotStyle({
  slot: "date-picker-nav",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** A previous or next month button. */
export const datePickerNavButtonStyle = defineSlotStyle({
  slot: "date-picker-nav-button",
  base: "rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
  variants: {},
  defaultVariants: {},
});

/** The month and year dropdown pair. */
export const datePickerSelectsStyle = defineSlotStyle({
  slot: "date-picker-selects",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The display-zone label under the calendar. */
export const datePickerZoneStyle = defineSlotStyle({
  slot: "date-picker-zone",
  base: "mt-2 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The row holding Now, Close and Select. */
export const datePickerFooterStyle = defineSlotStyle({
  slot: "date-picker-footer",
  base: "mt-3 gap-2 border-t border-input pt-2",
  variants: {},
  defaultVariants: {},
});

/** The Close and Select button pair. */
export const datePickerActionsStyle = defineSlotStyle({
  slot: "date-picker-actions",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** One footer button: Now, Close (discard) or Select (commit). */
export const datePickerActionStyle = defineSlotStyle({
  slot: "date-picker-action",
  base: "rounded-md text-xs",
  variants: {
    kind: {
      now: "px-2 hover:bg-accent hover:text-accent-foreground",
      close: "border border-input px-2.5 hover:bg-accent hover:text-accent-foreground",
      select: "bg-primary px-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
    },
  },
  defaultVariants: { kind: "now" },
});

/** The button that clears the field. */
export const datePickerClearStyle = defineSlotStyle({
  slot: "date-picker-clear",
  base: "z-2 rounded-sm p-0.5 transition-colors hover:bg-muted focus-visible:outline-none [&>svg]:opacity-50 [&>svg:hover]:opacity-100 focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/**
 * The calendar inside the date picker's popover: a part on the calendar, which carries its own slot.
 *
 * p-0, and no width override: the popover already pads, so the calendar's own padding on top of it
 * inset the day grid and left dead space at both edges. Its intrinsic (w-fit) width must survive
 * though - forcing w-full hands sizing to the narrower month/year row above, and the day cells then
 * overflow their tracks and overlap sideways while rows keep full height.
 */
export const datePickerCalendarStyle = defineSlotStyle({
  slot: "date-picker-calendar",
  as: "part",
  base: "p-0",
  variants: {},
  defaultVariants: {},
});
