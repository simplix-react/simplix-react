import { defineSlotStyle } from "../../design/slot-style";

/** The signature canvas's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const signaturePadCanvasStyle = defineSlotStyle({
  slot: "signature-pad-canvas",
  base: "rounded-md border border-input bg-white",
  variants: {
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { disabled: false },
});

/** The clear button over the canvas corner. */
export const signaturePadClearStyle = defineSlotStyle({
  slot: "signature-pad-clear",
  base: "rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground",
  variants: {},
  defaultVariants: {},
});
