import { defineSlotStyle } from "../../design/slot-style";

/** The popover select trigger's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const selectFieldTriggerStyle = defineSlotStyle({
  slot: "field-select-trigger",
  base: "gap-1 rounded-md border border-input bg-background px-3 text-left text-sm focus-visible:border-foreground focus-visible:outline-none",
  variants: {
    disabled: { true: "cursor-not-allowed opacity-50", false: "" },
    invalid: { true: "border-destructive focus-visible:border-destructive", false: "" },
  },
  defaultVariants: { disabled: false, invalid: false },
});

/** The strip of sibling buttons laid over the trigger's trailing edge. */
export const selectFieldTriggerActionsStyle = defineSlotStyle({
  slot: "field-select-trigger-actions",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The positioning wrapper around the trigger; muted while the field shows its placeholder. */
export const selectFieldTriggerWrapperStyle = defineSlotStyle({
  slot: "field-select-trigger-wrapper",
  base: "",
  variants: {
    empty: { true: "text-muted-foreground", false: "" },
  },
  defaultVariants: { empty: false },
});
