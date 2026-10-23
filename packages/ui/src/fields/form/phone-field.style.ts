import { defineSlotStyle } from "../../design/slot-style";

/** The phone field's calling-code button. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const phoneTriggerStyle = defineSlotStyle({
  slot: "field-phone-trigger",
  base: "gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring",
  variants: {
    disabled: { true: "cursor-not-allowed opacity-50", false: "" },
    invalid: { true: "border-destructive", false: "" },
    empty: { true: "text-muted-foreground", false: "" },
  },
  defaultVariants: { disabled: false, invalid: false, empty: false },
});

/** The chevron inside the calling-code button. */
export const phoneChevronStyle = defineSlotStyle({
  slot: "field-phone-chevron",
  base: "opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The calling code at the trailing edge of a country option. */
export const phoneOptionCodeStyle = defineSlotStyle({
  slot: "field-phone-option-code",
  base: "ml-auto pl-2 text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
