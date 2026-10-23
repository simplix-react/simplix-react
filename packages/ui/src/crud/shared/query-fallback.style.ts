import { defineSlotStyle } from "../../design/slot-style";

/** The loading placeholder. */
export const queryFallbackLoadingStyle = defineSlotStyle({
  slot: "query-fallback-loading",
  base: "py-12",
  variants: {},
  defaultVariants: {},
});

/** The spinner in the loading placeholder. */
export const queryFallbackSpinnerStyle = defineSlotStyle({
  slot: "query-fallback-spinner",
  base: "animate-spin rounded-full border-2 border-primary border-t-transparent",
  variants: {},
  defaultVariants: {},
});

/** The not-found message. */
export const queryFallbackNotFoundStyle = defineSlotStyle({
  slot: "query-fallback-not-found",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
