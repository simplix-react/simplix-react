import { defineSlotStyle } from "../../../design/slot-style";

/** The box around a thumbnail image. */
export const fileThumbnailImageStyle = defineSlotStyle({
  slot: "file-thumbnail-image",
  base: "rounded-sm bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The hover overlay of an interactive thumbnail. */
export const fileThumbnailOverlayStyle = defineSlotStyle({
  slot: "file-thumbnail-overlay",
  base: "rounded-sm bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
  variants: {},
  defaultVariants: {},
});

/** The representative star badge of an interactive thumbnail. */
export const fileThumbnailStarStyle = defineSlotStyle({
  slot: "file-thumbnail-star",
  base: "rounded-full bg-background shadow-sm transition-opacity duration-150",
  variants: {
    representative: {
      true: "opacity-100 scale-100",
      false: "opacity-0 group-hover:opacity-60",
    },
  },
  defaultVariants: { representative: false },
});

/** The representative star badge of a display-only thumbnail. */
export const fileThumbnailStaticStarStyle = defineSlotStyle({
  slot: "file-thumbnail-static-star",
  base: "rounded-full bg-background shadow-sm",
  variants: {},
  defaultVariants: {},
});
