import { defineSlotStyle } from "../../design/slot-style";

/** The value and copy button of a text field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailTextFieldValueStyle = defineSlotStyle({
  slot: "detail-text-field-value",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The copy-to-clipboard button of a text field. */
export const detailTextFieldCopyStyle = defineSlotStyle({
  slot: "detail-text-field-copy",
  base: "rounded-sm transition-colors",
  variants: {
    // The confirmed colour replaces the resting colour, so each sits in its own value.
    copied: {
      true: "text-green-600",
      false: "text-muted-foreground hover:text-foreground",
    },
  },
  defaultVariants: { copied: false },
});
