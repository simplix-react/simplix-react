import { defineSlotStyle } from "../../design/slot-style";

/** The inline icon picker's placeholder trigger, shown while the picker loads. */
export const inlineIconPickerPlaceholderStyle = defineSlotStyle({
  slot: "field-icon-trigger-placeholder",
  base: "rounded-md border-2 border-dashed bg-background disabled:cursor-not-allowed disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The inline icon picker's trigger button. */
export const inlineIconPickerTriggerStyle = defineSlotStyle({
  slot: "field-icon-trigger",
  base: "rounded-md border-2 bg-background transition-all hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    filled: { true: "border-solid", false: "border-dashed" },
  },
  defaultVariants: { filled: false },
});

/** The placeholder glyph of an empty inline icon picker. */
export const inlineIconPickerGlyphStyle = defineSlotStyle({
  slot: "field-icon-trigger-glyph",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
