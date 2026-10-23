import { defineSlotStyle } from "../../../design/slot-style";

/** The body that holds the description input. */
export const descriptionEditDialogBodyStyle = defineSlotStyle({
  slot: "description-edit-dialog-body",
  base: "py-1",
  variants: {},
  defaultVariants: {},
});

/** The close button: a part on the button, which carries its own slot. */
export const descriptionEditDialogCloseStyle = defineSlotStyle({
  slot: "description-edit-dialog-close",
  as: "part",
  base: "-mr-1",
  variants: {},
  defaultVariants: {},
});

/** The title and close button row of the dialog header. */
export const descriptionEditDialogTitleRowStyle = defineSlotStyle({
  slot: "description-edit-dialog-title-row",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});
