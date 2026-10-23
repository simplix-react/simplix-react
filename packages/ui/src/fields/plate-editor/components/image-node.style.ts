import { defineSlotStyle } from "../../../design/slot-style";

/** The image element. */
export const plateImageStyle = defineSlotStyle({
  slot: "plate-image",
  base: "my-4",
  variants: {},
  defaultVariants: {},
});

/** The image itself. */
export const plateImagePictureStyle = defineSlotStyle({
  slot: "plate-image-picture",
  base: "rounded-md",
  variants: {
    selected: { true: "ring-2 ring-primary ring-offset-2", false: "" },
  },
  defaultVariants: { selected: false },
});

/** The placeholder element for an uploading image. */
export const plateImagePlaceholderStyle = defineSlotStyle({
  slot: "plate-image-placeholder",
  base: "my-4 rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8",
  variants: {},
  defaultVariants: {},
});

/** The spinner and text column. */
export const plateImagePlaceholderBodyStyle = defineSlotStyle({
  slot: "plate-image-placeholder-body",
  base: "gap-2 text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The upload spinner. */
export const plateImagePlaceholderSpinnerStyle = defineSlotStyle({
  slot: "plate-image-placeholder-spinner",
  base: "animate-spin rounded-full border-2 border-primary border-t-transparent",
  variants: {},
  defaultVariants: {},
});

/** The upload text. */
export const plateImagePlaceholderTextStyle = defineSlotStyle({
  slot: "plate-image-placeholder-text",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});
