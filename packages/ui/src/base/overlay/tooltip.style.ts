import { defineSlotStyle } from "../../design/slot-style";

/** The tooltip bubble. */
export const tooltipContentStyle = defineSlotStyle({
  slot: "tooltip-content",
  base: "bg-foreground text-background rounded-md px-3 py-1.5 text-xs text-balance duration-[var(--dur-base)] ease-[var(--ease-spring)] data-[state=closed]:ease-[var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** The arrow pointing from the bubble to its trigger. */
export const tooltipArrowStyle = defineSlotStyle({
  slot: "tooltip-arrow",
  base: "bg-foreground fill-foreground rounded-[2px]",
  variants: {},
  defaultVariants: {},
});
