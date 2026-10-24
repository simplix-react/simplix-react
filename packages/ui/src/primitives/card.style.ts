import { defineSlotStyle } from "../design/slot-style";

/** The card primitive's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const cardStyle = defineSlotStyle({
  slot: "card",
  base: "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
  variants: {
    /**
     * Horizontal and vertical padding are set apart, and the vertical one is a step smaller.
     *
     * <p>A card is wider than it is tall and its content is lines of text, so equal padding on
     * all four sides spends the height that lines would use on empty space above and below them
     * - a three-line stat card came out 130px tall, of which 48px was padding. The sides still
     * need the full step: that is the gutter between the border and the first character, and
     * narrowing it makes the text look pressed against the edge.
     */
    padding: {
      none: "",
      sm: "px-4 py-3",
      md: "px-6 py-4",
      lg: "px-8 py-6",
    },
    interactive: {
      // Pointed at, an interactive card lifts 1px with a shadow; pressed, it settles.
      true: "hover:border-primary/30 hover:shadow-md transition-[box-shadow,border-color,translate,scale] duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
      false: "",
    },
    /** A card drawn as a button aligns its content to the start edge. */
    button: { true: "text-left", false: "" },
  },
  defaultVariants: { padding: "md", interactive: false, button: false },
});
