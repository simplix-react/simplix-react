import { defineSlotStyle } from "../../design/slot-style";

/** One previous/next day button of the date navigator. Drawn by `theme/designs/classic.css`. */
export const dateNavigatorStepStyle = defineSlotStyle({
  slot: "date-navigator-step",
  base: "border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  variants: {
    side: {
      prev: "rounded-l-md rounded-r-none",
      next: "rounded-r-md rounded-l-none -ml-px",
    },
  },
  defaultVariants: { side: "prev" },
});
