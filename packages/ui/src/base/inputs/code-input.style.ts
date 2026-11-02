import { defineSlotStyle } from "../../design/slot-style";

/** The code input's row of cells, centred in its container. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const codeInputStyle = defineSlotStyle({
  slot: "code-input",
  base: "flex w-full items-center justify-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** One square cell of the code input; a refused code draws a heavier border in the error colour. */
export const codeInputCellStyle = defineSlotStyle({
  slot: "code-input-cell",
  base: "aspect-square w-12 min-w-0 shrink rounded-md bg-background p-0 text-center font-mono text-xl font-semibold text-foreground caret-primary focus-visible:outline-none focus-visible:border-foreground focus-visible:shadow-[var(--focus-halo)] disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    invalid: {
      true: "border-2 border-destructive",
      false: "border border-input",
    },
  },
  defaultVariants: { invalid: false },
});
