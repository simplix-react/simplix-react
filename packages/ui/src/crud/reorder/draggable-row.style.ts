import { defineSlotStyle } from "../../design/slot-style";

/**
 * A table row that can be dragged to a new position. A selected row is tinted, the open record
 * more strongly (a row both selected and open draws the open tint), and the row being dragged
 * fades.
 */
export const draggableRowStyle = defineSlotStyle({
  slot: "draggable-row",
  as: "part",
  base: "",
  variants: {
    selected: { true: "bg-muted/30", false: "" },
    active: { true: "bg-muted/50", false: "" },
    dragging: { true: "opacity-50", false: "" },
  },
  defaultVariants: { selected: false, active: false, dragging: false },
});

/** The narrow cell that holds a row's drag handle. */
export const draggableRowHandleCellStyle = defineSlotStyle({
  slot: "draggable-row-handle-cell",
  as: "part",
  base: "px-2",
  variants: {},
  defaultVariants: {},
});
