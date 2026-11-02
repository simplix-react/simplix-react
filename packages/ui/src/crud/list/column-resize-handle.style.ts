import { defineSlotStyle } from "../../design/slot-style";

/**
 * The grip on a column header's trailing edge. It takes keyboard focus (the arrow keys move the
 * edge), so it draws the inset halo then: an outward ring would be cut by the table's scroll box.
 */
export const columnResizeHandleStyle = defineSlotStyle({
  slot: "column-resize-handle",
  base: "hover:bg-current/25 focus-visible:bg-current/40 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo-inset)]",
  variants: {},
  defaultVariants: {},
});
