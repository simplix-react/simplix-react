import { defineSlotStyle } from "../../design/slot-style";

/** The radio group of the field: a part on the group, which carries the radio component's own slot. */
export const radioGroupFieldGroupStyle = defineSlotStyle({
  slot: "field-radio-group",
  as: "part",
  base: "",
  variants: {
    direction: { column: "gap-2", row: "gap-4" },
  },
  defaultVariants: { direction: "column" },
});

/** One radio option row. */
export const radioGroupFieldOptionStyle = defineSlotStyle({
  slot: "field-radio-option",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The option label text. */
export const radioGroupFieldLabelStyle = defineSlotStyle({
  slot: "field-radio-label",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});

/** The option description under its label. */
export const radioGroupFieldDescriptionStyle = defineSlotStyle({
  slot: "field-radio-description",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
