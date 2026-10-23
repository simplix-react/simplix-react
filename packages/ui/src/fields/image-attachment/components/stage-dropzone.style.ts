import { defineSlotStyle } from "../../../design/slot-style";

/** The empty stage that accepts a dropped image. */
export const stageDropzoneStyle = defineSlotStyle({
  slot: "stage-dropzone",
  base: "transition-[background]",
  variants: {
    // The dragged-over colour replaces the resting one, so each sits in its own value.
    over: {
      true: "bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]",
      false: "bg-muted",
    },
  },
  defaultVariants: { over: false },
});

/** The dashed border affordance inset from the stage edge. */
export const stageDropzoneOutlineStyle = defineSlotStyle({
  slot: "stage-dropzone-outline",
  base: "rounded-md border-2 border-dashed transition-colors",
  variants: {
    over: { true: "border-primary", false: "border-input" },
  },
  defaultVariants: { over: false },
});

/** The icon, text and call to action column. */
export const stageDropzoneBodyStyle = defineSlotStyle({
  slot: "stage-dropzone-body",
  base: "gap-2 @md:gap-[14px] text-center px-4 py-4 @md:px-6 @md:py-6",
  variants: {},
  defaultVariants: {},
});

/** The upload icon tile. */
export const stageDropzoneIconStyle = defineSlotStyle({
  slot: "stage-dropzone-icon",
  base: "rounded-lg bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** The drop title. */
export const stageDropzoneTitleStyle = defineSlotStyle({
  slot: "stage-dropzone-title",
  base: "text-[15.5px] font-bold text-foreground tracking-[-0.01em] leading-[1.35]",
  variants: {},
  defaultVariants: {},
});

/** The constraints row. */
export const stageDropzoneConstraintsStyle = defineSlotStyle({
  slot: "stage-dropzone-constraints",
  base: "gap-[10px] text-[11.5px] text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One constraint. */
export const stageDropzonePillStyle = defineSlotStyle({
  slot: "stage-dropzone-pill",
  base: "gap-[5px]",
  variants: {},
  defaultVariants: {},
});

/** The glyph of a constraint. */
export const stageDropzonePillIconStyle = defineSlotStyle({
  slot: "stage-dropzone-pill-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The current and maximum file count. */
export const stageDropzoneCountStyle = defineSlotStyle({
  slot: "stage-dropzone-count",
  base: "ml-[2px] tabular-nums font-bold text-foreground tracking-[-0.005em]",
  variants: {},
  defaultVariants: {},
});

/** The allowed extensions constraint that opens a tooltip. */
export const stageDropzoneExtensionsStyle = defineSlotStyle({
  slot: "stage-dropzone-extensions",
  base: "gap-[5px] rounded-sm px-[2px] mx-[-2px] transition-colors hover:text-secondary-foreground hover:bg-muted focus-visible:outline-none focus-visible:text-secondary-foreground focus-visible:bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The extensions tooltip. */
export const stageDropzoneTooltipStyle = defineSlotStyle({
  slot: "stage-dropzone-tooltip",
  base: "bg-foreground text-white text-[11.5px] leading-[1.5] py-[7px] px-[11px] rounded text-left font-medium tracking-[.01em] opacity-0 transition-[opacity,transform] group-hover:opacity-100 group-focus-within:opacity-100",
  variants: {},
  defaultVariants: {},
});

/** The tooltip title. */
export const stageDropzoneTooltipTitleStyle = defineSlotStyle({
  slot: "stage-dropzone-tooltip-title",
  base: "font-semibold text-white mb-[3px] text-[10.5px] opacity-75 tracking-[.04em] uppercase",
  variants: {},
  defaultVariants: {},
});

/** The tooltip arrow. */
export const stageDropzoneTooltipArrowStyle = defineSlotStyle({
  slot: "stage-dropzone-tooltip-arrow",
  base: "ml-[-5px] bg-foreground rounded-sm",
  variants: {},
  defaultVariants: {},
});

/** The call to action button. */
export const stageDropzoneCtaStyle = defineSlotStyle({
  slot: "stage-dropzone-cta",
  base: "mt-[2px] px-[18px] rounded bg-primary text-primary-foreground border-none text-[12.5px] font-semibold transition-[background] hover:bg-[var(--primary-hover,var(--primary))] font-[inherit]",
  variants: {},
  defaultVariants: {},
});
