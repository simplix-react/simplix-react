import { defineSlotStyle } from "../../design/slot-style";

/**
 * The time select control's outer wrapper. It draws nothing itself; the slot is the handle other
 * slots use to space it (the date picker panel).
 */
export const timeSelectControlStyle = defineSlotStyle({
  slot: "time-select-control",
  base: "",
  variants: {},
  defaultVariants: {},
});

/**
 * The bordered row holding the hour and minute fields.
 *
 * <p>The hour and minute fields carry no ring of their own - two rings inside one control
 * read as two controls - so the box they sit in shows where the keyboard is, the way
 * `number-input` and `multi-select-field` do.
 */
export const timeSelectRowStyle = defineSlotStyle({
  slot: "time-select-row",
  base: "rounded-md border border-input bg-background focus-within:border-foreground",
  variants: {
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { disabled: false },
});

/** The colon between the hour and the minute. */
export const timeSelectColonStyle = defineSlotStyle({
  slot: "time-select-colon",
  base: "border-l border-input px-1 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/**
 * The typing field of one time unit.
 *
 * <p>`outline-none` with nothing put back: the box around the hour and minute fields
 * carries `focus-within:border-foreground`, and two rings inside one control read as
 * two controls.
 */
export const timeSpinnerInputStyle = defineSlotStyle({
  slot: "time-spinner-input",
  base: "bg-transparent text-center text-sm outline-none",
  variants: {},
  defaultVariants: {},
});

/** The step button column beside a time field. */
export const timeSpinnerSteppersStyle = defineSlotStyle({
  slot: "time-spinner-steppers",
  base: "border-l border-input",
  variants: {},
  defaultVariants: {},
});

/** One step button of a time field. */
export const timeSpinnerStepStyle = defineSlotStyle({
  slot: "time-spinner-step",
  base: "px-0.5 hover:bg-accent hover:text-accent-foreground",
  variants: {
    direction: {
      increase: "",
      decrease: "border-t border-input",
    },
  },
  defaultVariants: { direction: "increase" },
});

/** The AM/PM toggle group. */
export const timeMeridiemStyle = defineSlotStyle({
  slot: "time-meridiem",
  base: "border-r border-input",
  variants: {},
  defaultVariants: {},
});

/** One AM or PM button. */
export const timeMeridiemOptionStyle = defineSlotStyle({
  slot: "time-meridiem-option",
  base: "px-2 text-xs",
  variants: {
    position: {
      first: "",
      second: "border-l border-input",
    },
    active: {
      true: "bg-primary text-primary-foreground",
      false: "hover:bg-accent hover:text-accent-foreground",
    },
  },
  defaultVariants: { position: "first", active: false },
});

/** The floating option list under or over a time field. */
export const timeScrollColumnStyle = defineSlotStyle({
  slot: "time-scroll-column",
  base: "rounded-md border border-input bg-popover shadow-md",
  variants: {
    drop: {
      up: "mb-1",
      down: "mt-1",
    },
  },
  defaultVariants: { drop: "down" },
});

/** The scrolling list inside the option column. */
export const timeScrollListStyle = defineSlotStyle({
  slot: "time-scroll-list",
  base: "gap-0.5 p-1",
  variants: {},
  defaultVariants: {},
});

/** One option of the floating list. */
export const timeScrollOptionStyle = defineSlotStyle({
  slot: "time-scroll-option",
  base: "rounded-md text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  variants: {
    selected: {
      true: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      false: "",
    },
  },
  defaultVariants: { selected: false },
});
