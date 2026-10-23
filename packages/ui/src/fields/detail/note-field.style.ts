import { defineSlotStyle } from "../../design/slot-style";

/** The label-less card of a note field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailNoteFieldStyle = defineSlotStyle({
  slot: "detail-note-field",
  base: "rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
