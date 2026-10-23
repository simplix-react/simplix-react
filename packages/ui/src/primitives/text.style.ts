import { defineSlotStyle } from "../design/slot-style";

/** The text primitive's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const textStyle = defineSlotStyle({
  slot: "text",
  base: "font-normal",
  variants: {
    size: {
      lg: "text-lg",
      base: "text-base",
      sm: "text-sm",
      caption: "text-xs",
      /**
       * Take the size of whatever encloses it. The default, so a Text that was not asked for a
       * size does not impose one.
       *
       * <p>A typography primitive that defaults to a fixed size cannot compose: a table cell
       * declares its record text at `text-sm` and the Text inside it silently renders at
       * `text-base`, so the size the cell set never appears on screen. Nothing errors, the diff
       * reads correctly, and the row is simply a size larger than every other row on the page.
       * Inheriting makes the enclosing context the answer, which is what a caller who named no
       * size meant.
       */
      inherit: "",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      /**
       * Something the reader should notice and can proceed past.
       *
       * <p>The step between `muted` and `destructive`, and the one that was missing: a caps-lock
       * hint and a 「저장되었지만 아직 적용되지 않았다」 are neither ignorable nor a refusal, and
       * without a name for that the screens wrote `text-amber-700 dark:text-amber-300` by hand -
       * which is a colour rather than a meaning, and does not move when the palette does.
       */
      warning: "text-warning",
    },
    font: {
      sans: "font-sans",
      display: "font-display",
      mono: "font-mono",
    },
    /**
     * How heavy the text is.
     *
     * <p>Inherits by default, for the reason `size` does: a primitive that imposes a weight cannot
     * sit inside a heading or a cell that already set one. Named here because a caller who wants
     * emphasis has nowhere else to say it - two dozen screens of one product were writing
     * `className="font-medium"`, which reaches past the primitive to the stylesheet and stops
     * moving when the type scale does.
     */
    /** How the text sits in its line box, for the places a caption is centred under something. */
    align: {
      inherit: "",
      start: "text-left",
      center: "text-center",
      end: "text-right",
    },
    weight: {
      inherit: "",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    },
  defaultVariants: { size: "inherit", tone: "default", weight: "inherit", align: "inherit" },
});
