import { defineSlotStyle } from "../../design/slot-style";

/** The number input box's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const numberInputStyle = defineSlotStyle({
  slot: "number-input",
  base: "rounded-md border border-input bg-background text-sm focus-within:border-foreground has-[[aria-invalid=true]]:border-destructive",
  variants: {
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { disabled: false },
});

/**
 * The typing field inside the box.
 *
 * <p>`outline-none` with nothing put back: the box around this input carries
 * `focus-within:border-foreground`, so focus shows on the control the reader sees as
 * one thing. A ring on the inner field would draw a second control inside the first.
 */
export const numberInputFieldStyle = defineSlotStyle({
  slot: "number-input-field",
  base: "text-center bg-transparent px-1.5 py-1.5 outline-none placeholder:text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The unit suffix between the number and the spinner. */
export const numberInputSuffixStyle = defineSlotStyle({
  slot: "number-input-suffix",
  base: "pr-1.5 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The spinner column with its divider. */
export const numberInputSpinnerStyle = defineSlotStyle({
  slot: "number-input-spinner",
  base: "border-l border-input",
  variants: {},
  defaultVariants: {},
});

/** One step button of the spinner. */
export const numberInputStepStyle = defineSlotStyle({
  slot: "number-input-step",
  base: "px-0.5 hover:bg-accent hover:text-accent-foreground",
  variants: {
    direction: {
      increase: "",
      decrease: "border-t border-input",
    },
  },
  defaultVariants: { direction: "increase" },
});
