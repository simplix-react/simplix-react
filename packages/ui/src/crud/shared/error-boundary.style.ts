import { defineSlotStyle } from "../../design/slot-style";

/** The default fallback panel. */
export const errorBoundaryStyle = defineSlotStyle({
  slot: "error-boundary",
  as: "part",
  base: "rounded-lg border border-destructive/50 bg-destructive/5 p-8",
  variants: {},
  defaultVariants: {},
});

/** The fallback's headline. */
export const errorBoundaryTitleStyle = defineSlotStyle({
  slot: "error-boundary-title",
  base: "text-sm font-medium text-destructive",
  variants: {},
  defaultVariants: {},
});

/** The error message. */
export const errorBoundaryMessageStyle = defineSlotStyle({
  slot: "error-boundary-message",
  base: "text-center text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The retry button. */
export const errorBoundaryRetryStyle = defineSlotStyle({
  slot: "error-boundary-retry",
  base: "rounded-md px-4 text-sm font-medium border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  variants: {},
  defaultVariants: {},
});
