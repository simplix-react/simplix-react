import { defineSlotStyle } from "../../design/slot-style";

/** The helper text under a labeled field's label. */
export const labeledFieldDescriptionStyle = defineSlotStyle({
  slot: "labeled-field-description",
  base: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
  variants: {},
  defaultVariants: {},
});

/**
 * The label of a labeled field, set on the shared `Label` as a part. The class-string form passed
 * `text-sm`, which tailwind-merge let drop the label's own `leading-none`; the line height is
 * stated here, because the label's `leading-none` still sets `--tw-leading`, which `text-sm` reads.
 */
export const labeledFieldLabelStyle = defineSlotStyle({
  slot: "labeled-field-label",
  as: "part",
  base: "text-sm leading-[var(--text-sm--line-height)]",
  variants: {},
  defaultVariants: {},
});
