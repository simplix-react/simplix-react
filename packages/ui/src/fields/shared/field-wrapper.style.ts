import { defineSlotStyle } from "../../design/slot-style";

/** The form field wrapper's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const fieldWrapperStyle = defineSlotStyle({
  slot: "field-wrapper",
  base: "py-1",
  variants: {
    layout: {
      top: "flex flex-col gap-1",
      left: "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1",
      inline: "flex items-center justify-between gap-3",
      trailing: "flex flex-col gap-1",
      hidden: "flex flex-col gap-1.5",
    },
    size: {
      sm: "[&_label]:text-xs [&_input]:h-8 [&_input]:text-sm",
      md: "[&_label]:text-sm [&_input]:h-10 [&_input]:text-base",
      lg: "[&_label]:text-base [&_input]:h-12 [&_input]:text-lg",
    },
  },
  defaultVariants: { layout: "top", size: "sm" },
});

/** The row holding a field's control between its prefix and suffix adornments. */
export const fieldInputRowStyle = defineSlotStyle({
  slot: "field-input-row",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The asterisk after a required field's label. */
export const fieldRequiredStyle = defineSlotStyle({
  slot: "field-required",
  base: "text-destructive ml-0.5",
  variants: {},
  defaultVariants: {},
});

/** The label row of a `trailing` layout field: label, extra, leader, control. */
export const fieldTrailingRowStyle = defineSlotStyle({
  slot: "field-trailing-row",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** The dashed leader line between the label and the control of a `trailing` layout field. */
export const fieldLeaderStyle = defineSlotStyle({
  slot: "field-leader",
  base: "border-b border-dashed border-border",
  variants: {},
  defaultVariants: {},
});
