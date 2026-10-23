import { defineSlotStyle } from "../design/slot-style";

/** The heading primitive's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const headingStyle = defineSlotStyle({
  slot: "heading",
  base: "tracking-tight",
  variants: {
    level: {
      1: "text-4xl font-bold",
      2: "text-3xl font-semibold",
      3: "text-2xl font-semibold",
      4: "text-xl font-semibold",
      5: "text-lg font-medium",
      6: "text-base font-medium",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    font: {
      sans: "font-sans",
      display: "font-display",
      mono: "font-mono",
    },
    },
  defaultVariants: { level: 1, tone: "default" },
});
