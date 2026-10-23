import { defineSlotStyle } from "../../design/slot-style";

/** The inline field message's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const fieldMessageStyle = defineSlotStyle({
  slot: "field-message",
  base: "text-xs leading-3.5",
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
