import { defineSlotStyle } from "../../design/slot-style";

/** The inline field message's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const fieldMessageStyle = defineSlotStyle({
  slot: "field-message",
  // Timing for the ease-in (the shared appear pattern) the component puts on an error or a warning.
  base: "text-xs leading-3.5 duration-[var(--dur-base)] ease-[var(--ease-spring)]",
  variants: {
    variant: {
      error: "text-destructive",
      warning: "text-warning",
      info: "text-info",
      description: "text-muted-foreground",
    },
    icon: { true: "gap-1", false: "" },
  },
  defaultVariants: { variant: "error", icon: false },
});
