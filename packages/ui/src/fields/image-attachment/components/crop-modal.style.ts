import { defineSlotStyle } from "../../../design/slot-style";

/** The crop dialog header. */
export const cropModalHeaderStyle = defineSlotStyle({
  slot: "crop-modal-header",
  base: "px-5 py-[10px] pr-12 border-b border-border gap-2",
  variants: {},
  defaultVariants: {},
});

/** The tile behind the header glyph. */
export const cropModalIconStyle = defineSlotStyle({
  slot: "crop-modal-icon",
  base: "rounded-sm bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success",
  variants: {},
  defaultVariants: {},
});

/** The dialog title. */
export const cropModalTitleStyle = defineSlotStyle({
  slot: "crop-modal-title",
  base: "text-[14px] font-semibold text-foreground leading-[1.3] tracking-[-0.005em] m-0",
  variants: {},
  defaultVariants: {},
});

/** The custom close button (mimics .fa-imv-close). */
export const cropModalCloseStyle = defineSlotStyle({
  slot: "crop-modal-close",
  base: "bg-transparent border-none rounded-sm text-muted-foreground opacity-70 transition-[opacity,background,color] hover:opacity-100 hover:bg-muted hover:text-foreground font-[inherit]",
  variants: {},
  defaultVariants: {},
});

/** The dark stage around the image; the crop dark stage background has no token (styles.css:286). */
export const cropModalBodyStyle = defineSlotStyle({
  slot: "crop-modal-body",
  base: "px-6 py-6 bg-[#0f1320]",
  variants: {},
  defaultVariants: {},
});

/** The crop frame; the scrim is a large box-shadow with no token (styles.css:289). */
export const cropModalFrameStyle = defineSlotStyle({
  slot: "crop-modal-frame",
  base: "border-2 border-dashed border-white outline outline-1 outline-offset-[-2px] outline-[rgba(15,19,32,.55)] shadow-[0_0_0_9999px_rgba(15,19,32,.6)]",
  variants: {},
  defaultVariants: {},
});

/** A corner resize handle, semi-hardcoded (styles.css:293). */
export const cropModalHandleStyle = defineSlotStyle({
  slot: "crop-modal-handle",
  base: "bg-white border border-primary rounded-sm shadow-[0_1px_2px_rgba(0,0,0,.25)]",
  variants: {},
  defaultVariants: {},
});

/** The dialog footer. */
export const cropModalFooterStyle = defineSlotStyle({
  slot: "crop-modal-footer",
  base: "gap-3 px-5 py-[10px] border-t border-border bg-muted/50",
  variants: {},
  defaultVariants: {},
});

/** The dimensions chip and ratio selector. */
export const cropModalMetaStyle = defineSlotStyle({
  slot: "crop-modal-meta",
  base: "gap-[6px] tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The dimensions chip. */
export const cropModalDimensionsStyle = defineSlotStyle({
  slot: "crop-modal-dimensions",
  base: "gap-[5px] px-2 rounded-full bg-card border border-border text-[11.5px] text-secondary-foreground leading-none font-medium tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The glyph in the dimensions chip. */
export const cropModalDimensionsIconStyle = defineSlotStyle({
  slot: "crop-modal-dimensions-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The dimensions text. */
export const cropModalDimensionsValueStyle = defineSlotStyle({
  slot: "crop-modal-dimensions-value",
  base: "font-semibold text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The aspect ratio selector. */
export const cropModalRatiosStyle = defineSlotStyle({
  slot: "crop-modal-ratios",
  base: "gap-1 px-1 rounded-full bg-card border border-border",
  variants: {},
  defaultVariants: {},
});

/** One aspect ratio button. */
export const cropModalRatioStyle = defineSlotStyle({
  slot: "crop-modal-ratio",
  base: "px-2 text-[11px] font-semibold rounded-full border-none font-[inherit] leading-none tracking-[-0.005em] transition-[background,color]",
  variants: {
    selected: {
      true: "bg-primary text-primary-foreground",
      false: "bg-transparent text-secondary-foreground hover:text-foreground",
    },
  },
  defaultVariants: { selected: false },
});

/** The cancel and save buttons. */
export const cropModalActionsStyle = defineSlotStyle({
  slot: "crop-modal-actions",
  base: "gap-[6px]",
  variants: {},
  defaultVariants: {},
});

/** The cancel button. */
export const cropModalCancelStyle = defineSlotStyle({
  slot: "crop-modal-cancel",
  base: "px-4 rounded text-[13px] font-semibold border border-border bg-card text-secondary-foreground font-[inherit] transition-[background,border-color,color] hover:border-[var(--border-strong,var(--border))]",
  variants: {},
  defaultVariants: {},
});

/** The save button. */
export const cropModalSaveStyle = defineSlotStyle({
  slot: "crop-modal-save",
  base: "px-4 rounded text-[13px] font-semibold border-none bg-primary text-primary-foreground font-[inherit] transition-[background] hover:bg-[var(--primary-hover,var(--primary))]",
  variants: {},
  defaultVariants: {},
});

/** The wrapper that sizes itself to the image, so no line box adds space below it. */
export const cropModalStageStyle = defineSlotStyle({
  slot: "crop-modal-stage",
  base: "leading-[0]",
  variants: {},
  defaultVariants: {},
});

/** The dialog content: a part on the dialog content, which carries its own slot; `flush` on the dialog drops its padding. */
export const cropModalContentStyle = defineSlotStyle({
  slot: "crop-modal-content",
  as: "part",
  base: "gap-0",
  variants: {},
  defaultVariants: {},
});
