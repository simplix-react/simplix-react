import { defineSlotStyle } from "../../design/slot-style";

/** The grip glyph; a disabled handle draws it faint. */
export const dragHandleGripStyle = defineSlotStyle({
  slot: "drag-handle-grip",
  base: "",
  variants: { muted: { true: "text-muted-foreground/30", false: "" } },
  defaultVariants: { muted: false },
});

/** The button a reader grabs to drag a row. */
export const dragHandleStyle = defineSlotStyle({
  slot: "drag-handle",
  base: "rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {},
  defaultVariants: {},
});

/**
 * The header button that turns on display-order sorting. While drag ordering is on it is
 * disabled but drawn at full strength, since it shows the order in force.
 */
export const dragHandleHeaderStyle = defineSlotStyle({
  slot: "drag-handle-header",
  as: "part",
  base: "",
  variants: { engaged: { true: "opacity-100", false: "" } },
  defaultVariants: { engaged: false },
});
