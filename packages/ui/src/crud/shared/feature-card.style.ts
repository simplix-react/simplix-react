import { defineSlotStyle } from "../../design/slot-style";

/** A bordered card with an optional header. */
export const featureCardStyle = defineSlotStyle({
  slot: "feature-card",
  base: "rounded-lg border border-border bg-card",
  variants: {},
  defaultVariants: {},
});

/** The card's header row. */
export const featureCardHeaderStyle = defineSlotStyle({
  slot: "feature-card-header",
  base: "gap-2 border-b border-border px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The title and icon at the header's start. */
export const featureCardTitleStyle = defineSlotStyle({
  slot: "feature-card-title",
  base: "gap-2 text-sm font-semibold text-foreground [&>svg]:text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The action at the header's end. */
export const featureCardActionStyle = defineSlotStyle({
  slot: "feature-card-action",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The card body. */
export const featureCardBodyStyle = defineSlotStyle({
  slot: "feature-card-body",
  base: "p-4",
  variants: {},
  defaultVariants: {},
});
