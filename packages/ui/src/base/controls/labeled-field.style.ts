import { defineSlotStyle } from "../../design/slot-style";

/** The helper text under a labeled field's label. */
export const labeledFieldDescriptionStyle = defineSlotStyle({
  slot: "labeled-field-description",
  base: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
  variants: {},
  defaultVariants: {},
});
