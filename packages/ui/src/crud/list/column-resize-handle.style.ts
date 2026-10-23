import { defineSlotStyle } from "../../design/slot-style";

/** The grip on a column header's trailing edge. */
export const columnResizeHandleStyle = defineSlotStyle({
  slot: "column-resize-handle",
  base: "hover:bg-current/25 focus-visible:bg-current/40 focus-visible:outline-none",
  variants: {},
  defaultVariants: {},
});
