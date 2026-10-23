import { defineSlotStyle } from "../../design/slot-style";

/** The padding that keeps the control group off the map edge. */
export const mapControlsStyle = defineSlotStyle({
  slot: "map-controls",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});

/** The bordered group of map controls. */
export const mapControlsGroupStyle = defineSlotStyle({
  slot: "map-controls-group",
  base: "rounded-md border bg-background shadow-md",
  variants: {},
  defaultVariants: {},
});

/** One button of the control group. */
export const mapControlButtonStyle = defineSlotStyle({
  slot: "map-control-button",
  base: "text-foreground/80 hover:bg-accent hover:text-foreground transition-colors",
  variants: {},
  defaultVariants: {},
});

/** The line between two controls of the group. */
export const mapControlSeparatorStyle = defineSlotStyle({
  slot: "map-control-separator",
  base: "bg-border",
  variants: {},
  defaultVariants: {},
});

/** The default dot drawn for a marker with no children. */
export const mapMarkerDotStyle = defineSlotStyle({
  slot: "map-marker-dot",
  base: "rounded-full border-2 border-white bg-blue-500 shadow-lg",
  variants: {},
  defaultVariants: {},
});

/** The teardrop outline of a pin marker. */
export const mapPinShapeStyle = defineSlotStyle({
  slot: "map-pin-shape",
  base: "fill-white dark:fill-neutral-800",
  variants: {},
  defaultVariants: {},
});
