import { defineSlotStyle } from "../../../design/slot-style";

/** The progress bar row. */
export const uploadProgressBarStyle = defineSlotStyle({
  slot: "upload-progress-bar",
  base: "gap-2.5",
  variants: {},
  defaultVariants: {},
});

/** The track of the progress bar. */
export const uploadProgressBarTrackStyle = defineSlotStyle({
  slot: "upload-progress-bar-track",
  base: "rounded-full bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The fill of the progress bar. */
export const uploadProgressBarFillStyle = defineSlotStyle({
  slot: "upload-progress-bar-fill",
  base: "bg-primary transition-[width]",
  variants: {},
  defaultVariants: {},
});

/** The percentage label. */
export const uploadProgressBarLabelStyle = defineSlotStyle({
  slot: "upload-progress-bar-label",
  base: "text-[10.5px] tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
