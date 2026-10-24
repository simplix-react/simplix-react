import { defineSlotStyle } from "../../design/slot-style";

/** One step of a stepline: the circle with its label. */
export const steplineItemStyle = defineSlotStyle({
  slot: "stepline-item",
  base: "",
  variants: {
    // The label stands 8px under its circle, clear of the ring.
    orientation: { vertical: "gap-3", horizontal: "gap-2 px-1" },
  },
  defaultVariants: { orientation: "horizontal" },
});

/** The numbered circle of a step. */
export const steplineCircleStyle = defineSlotStyle({
  slot: "stepline-circle",
  base: "rounded-full border-2 text-xs font-semibold transition-colors",
  variants: {
    state: {
      done: "border-primary bg-primary text-primary-foreground",
      current: "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
      upcoming: "border-muted-foreground/40 bg-background text-muted-foreground",
    },
  },
  defaultVariants: { state: "upcoming" },
});

/** The line joining two steps. */
export const steplineConnectorStyle = defineSlotStyle({
  slot: "stepline-connector",
  base: "",
  variants: {
    orientation: { vertical: "", horizontal: "mt-3.5" },
    /** The line is filled once the step before it is reached. */
    filled: { true: "bg-primary", false: "bg-border" },
  },
  defaultVariants: { orientation: "horizontal", filled: false },
});

/** The label of a step. */
export const steplineLabelStyle = defineSlotStyle({
  slot: "stepline-label",
  base: "",
  variants: {
    orientation: {
      vertical: "pb-4 pt-1 text-sm",
      horizontal: "text-center text-xs leading-tight",
    },
    current: { true: "font-semibold text-foreground", false: "text-muted-foreground" },
  },
  defaultVariants: { orientation: "horizontal", current: false },
});
