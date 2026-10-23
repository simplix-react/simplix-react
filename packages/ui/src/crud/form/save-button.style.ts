import { defineSlotStyle } from "../../design/slot-style";

/** The count of invalid fields on a save button: a small round badge with tiny figures. */
export const saveButtonErrorCountStyle = defineSlotStyle({
  slot: "save-button-error-count",
  as: "part",
  base: "p-0 text-[0.625rem]",
  variants: {},
  defaultVariants: {},
});
