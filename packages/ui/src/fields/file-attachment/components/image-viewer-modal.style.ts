import { defineSlotStyle } from "../../../design/slot-style";

/** The preview area of the image viewer. */
export const imageViewerModalBodyStyle = defineSlotStyle({
  slot: "image-viewer-modal-body",
  base: "px-6 py-2",
  variants: {},
  defaultVariants: {},
});

/** The box around the previewed image. */
export const imageViewerModalPreviewStyle = defineSlotStyle({
  slot: "image-viewer-modal-preview",
  base: "rounded bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The size and dimension badges. */
export const imageViewerModalMetaStyle = defineSlotStyle({
  slot: "image-viewer-modal-meta",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The close and download buttons. */
export const imageViewerModalActionsStyle = defineSlotStyle({
  slot: "image-viewer-modal-actions",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The close button: a part on the button, which carries its own slot. */
export const imageViewerModalCloseStyle = defineSlotStyle({
  slot: "image-viewer-modal-close",
  as: "part",
  base: "-mr-1",
  variants: {},
  defaultVariants: {},
});

/** The dialog footer: a part on the footer, which carries its own slot. */
export const imageViewerModalFooterStyle = defineSlotStyle({
  slot: "image-viewer-modal-footer",
  as: "part",
  base: "gap-3 sm:gap-2",
  variants: {},
  defaultVariants: {},
});

/** The title and close button row of the dialog header. */
export const imageViewerModalTitleRowStyle = defineSlotStyle({
  slot: "image-viewer-modal-title-row",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});
