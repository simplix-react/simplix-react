import { defineSlotStyle } from "../design/slot-style";

/** The stack's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const stackStyle = defineSlotStyle({
  slot: "stack",
  base: "",
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    padded: { true: "pt-4 pb-8" },
  },
  defaultVariants: { gap: "md", padded: false },
});

/** The placeholder a stack centres when it has no children. */
export const stackEmptyStyle = defineSlotStyle({
  slot: "stack-empty",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The gradient that fades the bottom edge of a clipped stack. */
export const stackFadeStyle = defineSlotStyle({
  slot: "stack-fade",
  base: "bg-gradient-to-t from-card to-transparent",
  variants: {},
  defaultVariants: {},
});
