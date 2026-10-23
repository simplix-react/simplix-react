import { defineSlotStyle } from "../../design/slot-style";

/** The padding around the calendar. */
export const calendarStyle = defineSlotStyle({
  slot: "calendar",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});

/** The row holding the month label and the navigation buttons. */
export const calendarHeaderStyle = defineSlotStyle({
  slot: "calendar-header",
  base: "pb-2",
  variants: {},
  defaultVariants: {},
});

/** The previous and next buttons. */
export const calendarNavButtonStyle = defineSlotStyle({
  slot: "calendar-nav-button",
  base: "rounded-md text-sm hover:bg-accent hover:text-accent-foreground",
  variants: {},
  defaultVariants: {},
});

/** The row of month labels between the navigation buttons. */
export const calendarTitleStyle = defineSlotStyle({
  slot: "calendar-title",
  base: "gap-4",
  variants: {},
  defaultVariants: {},
});

/** One month label. */
export const calendarTitleLabelStyle = defineSlotStyle({
  slot: "calendar-title-label",
  base: "text-sm font-medium",
  variants: {},
  defaultVariants: {},
});

/** The row of month panels shown side by side. */
export const calendarMonthsStyle = defineSlotStyle({
  slot: "calendar-months",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** One month panel; it is framed when several months are shown. */
export const calendarMonthPanelStyle = defineSlotStyle({
  slot: "calendar-month-panel",
  base: "",
  variants: {
    framed: { true: "rounded-md border border-input p-2", false: "" },
  },
  defaultVariants: { framed: false },
});

/** A seven-column grid: the weekday row, the day cells and the month-mode sizing row. */
export const calendarGridStyle = defineSlotStyle({
  slot: "calendar-grid",
  base: "gap-0",
  variants: {},
  defaultVariants: {},
});

/** A weekday label. */
export const calendarWeekdayStyle = defineSlotStyle({
  slot: "calendar-weekday",
  base: "text-sm font-medium text-muted-foreground md:text-xs",
  variants: {},
  defaultVariants: {},
});

/**
 * A day cell.
 *
 * Normal weight and a softened foreground: at this size full contrast reads heavier than the
 * muted weekday row above it. The state axes stack in the order the highlights override one
 * another: today, then the single selection, then range and week highlighting.
 */
export const calendarDayStyle = defineSlotStyle({
  slot: "calendar-day",
  base: "rounded-md text-lg font-normal text-foreground/80 md:text-[15px] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
  variants: {
    today: { true: "bg-accent/50 font-semibold", false: "" },
    // Single mode selection.
    selected: {
      true: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      false: "",
    },
    // Range mode highlighting.
    inRange: { true: "bg-accent rounded-none", false: "" },
    start: {
      true: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-l-md rounded-r-none",
      false: "",
    },
    end: {
      true: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-r-md rounded-l-none",
      false: "",
    },
    // Week mode: selected week background.
    weekSelected: { true: "bg-accent rounded-none", false: "" },
    // Week mode: hover week background.
    weekHover: { true: "bg-accent/50 rounded-none", false: "" },
  },
  defaultVariants: {
    today: false,
    selected: false,
    inRange: false,
    start: false,
    end: false,
    weekSelected: false,
    weekHover: false,
  },
});

/** The month grid of `month` mode. */
export const calendarMonthGridStyle = defineSlotStyle({
  slot: "calendar-month-grid",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** A month cell of `month` mode. */
export const calendarMonthStyle = defineSlotStyle({
  slot: "calendar-month",
  base: "rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
  variants: {
    current: { true: "bg-accent/50 font-semibold", false: "" },
    selected: {
      true: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      false: "",
    },
  },
  defaultVariants: { current: false, selected: false },
});
