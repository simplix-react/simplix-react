import { defineSlotStyle } from "../design/slot-style";

/** A row of mutually exclusive choices, with a thumb under the chosen one. */
export const segmentedControlStyle = defineSlotStyle({
  slot: "segmented-control",
  base: "rounded-md bg-muted p-0.5",
  variants: {},
  defaultVariants: {},
});

/** One choice. */
export const segmentedControlItemStyle = defineSlotStyle({
  slot: "segmented-control-item",
  base: "h-8 px-3.5 text-sm font-medium text-muted-foreground [transition:color_var(--dur-fast)_var(--ease)] hover:text-foreground focus-visible:outline-none rounded-sm focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    selected: { true: "text-foreground", false: "" },
  },
  defaultVariants: { selected: false },
});

/** The surface under the chosen item, which slides to the next choice. */
export const segmentedControlThumbStyle = defineSlotStyle({
  slot: "segmented-control-thumb",
  base: "rounded-sm bg-background shadow-sm [transition:transform_var(--dur-base)_var(--ease),width_var(--dur-base)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});
