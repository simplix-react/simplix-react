import { defineSlotStyle } from "../../../design/slot-style";

/** The carousel frame. */
export const carouselStyle = defineSlotStyle({
  slot: "carousel",
  base: "rounded border border-border bg-muted mt-[18px]",
  variants: {},
  defaultVariants: {},
});

/** The 16:9 stage; uploading and error draw a gradient over it. */
export const carouselStageStyle = defineSlotStyle({
  slot: "carousel-stage",
  base: "",
  variants: {
    // The overlay itself (pseudo-element, position, content) is structure on the element; this is its colour.
    status: {
      empty: "",
      uploading: "after:bg-[linear-gradient(180deg,rgba(18,104,179,0)_0%,rgba(18,104,179,.55)_100%)]",
      complete: "",
      error: "after:bg-[rgba(200,53,31,.55)]",
    },
  },
  defaultVariants: { status: "complete" },
});

/** The scene image wrapper; an error scene is greyed. */
export const carouselSceneStyle = defineSlotStyle({
  slot: "carousel-scene",
  base: "",
  variants: {
    status: {
      empty: "",
      uploading: "",
      complete: "",
      error: "[&>*]:grayscale [&>*]:brightness-50",
    },
  },
  defaultVariants: { status: "complete" },
});

/** The empty stage. */
export const carouselEmptyStyle = defineSlotStyle({
  slot: "carousel-empty",
  base: "bg-muted text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The icon and text column of the empty stage. */
export const carouselEmptyBodyStyle = defineSlotStyle({
  slot: "carousel-empty-body",
  base: "gap-2 p-5 text-center",
  variants: {},
  defaultVariants: {},
});

/** The empty stage glyph. */
export const carouselEmptyIconStyle = defineSlotStyle({
  slot: "carousel-empty-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The empty stage title. */
export const carouselEmptyTitleStyle = defineSlotStyle({
  slot: "carousel-empty-title",
  base: "text-(length:--fs-cell) leading-(--lh-cell) font-semibold text-secondary-foreground",
  variants: {},
  defaultVariants: {},
});

/** The empty stage description. */
export const carouselEmptyDescriptionStyle = defineSlotStyle({
  slot: "carousel-empty-description",
  base: "text-(length:--fs-caption) leading-(--lh-caption) text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The single-mode upload progress track. */
export const carouselProgressStyle = defineSlotStyle({
  slot: "carousel-progress",
  base: "rounded-full bg-white/35 shadow-[0_1px_2px_rgba(0,0,0,.2)]",
  variants: {},
  defaultVariants: {},
});

/** The fill of the upload progress track. */
export const carouselProgressFillStyle = defineSlotStyle({
  slot: "carousel-progress-fill",
  base: "rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]",
  variants: {},
  defaultVariants: {},
});

/** The percentage above the progress track. */
export const carouselProgressLabelStyle = defineSlotStyle({
  slot: "carousel-progress-label",
  base: "font-mono text-(length:--fs-label) leading-(--lh-label) font-semibold text-white tracking-[.01em] tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The icon and message column of the error overlay. */
export const carouselErrorBodyStyle = defineSlotStyle({
  slot: "carousel-error-body",
  base: "gap-2.5 text-center px-5",
  variants: {},
  defaultVariants: {},
});

/** The error message over the stage. */
export const carouselErrorMessageStyle = defineSlotStyle({
  slot: "carousel-error-message",
  base: "text-(length:--fs-control) leading-(--lh-control) font-semibold text-white tracking-[.01em]",
  variants: {},
  defaultVariants: {},
});

/** The previous and next buttons. */
export const carouselNavStyle = defineSlotStyle({
  slot: "carousel-nav",
  base: "rounded-full bg-white/95 border-none shadow-md text-foreground transition-transform hover:bg-white hover:scale-105 font-[inherit]",
  variants: {},
  defaultVariants: {},
});

/** The row of dots. */
export const carouselDotsStyle = defineSlotStyle({
  slot: "carousel-dots",
  base: "gap-[5px]",
  variants: {},
  defaultVariants: {},
});

/** One dot. */
export const carouselDotStyle = defineSlotStyle({
  slot: "carousel-dot",
  base: "border-none p-0 transition-[width,background]",
  variants: {
    // The active dot widens and squares its corners, which replaces the round shape and width.
    active: {
      true: "bg-white w-4 rounded-[var(--radius-xs)]",
      false: "bg-white/45 w-[6px] rounded-full",
    },
  },
  defaultVariants: { active: false },
});

/** The bar along the bottom of the stage. */
export const carouselBottomStyle = defineSlotStyle({
  slot: "carousel-bottom",
  base: "px-[14px] py-3 gap-3",
  variants: {},
  defaultVariants: {},
});

/** The file name badge; the glass background has no token. */
export const carouselFileBadgeStyle = defineSlotStyle({
  slot: "carousel-file-badge",
  base: "bg-[rgba(20,22,30,.62)] backdrop-blur-[8px] text-white gap-[6px] px-[11px] py-[6px] rounded text-(length:--fs-badge) leading-(--lh-badge) tracking-[.01em] font-medium shadow-[0_1px_2px_rgba(0,0,0,.18)]",
  variants: {},
  defaultVariants: {},
});

/** The glyph in the file name badge. */
export const carouselFileBadgeIconStyle = defineSlotStyle({
  slot: "carousel-file-badge-icon",
  base: "opacity-70",
  variants: {},
  defaultVariants: {},
});

/** The file name in the badge. */
export const carouselFileNameStyle = defineSlotStyle({
  slot: "carousel-file-name",
  base: "font-mono text-(length:--fs-label) leading-(--lh-label) font-semibold tracking-[.005em]",
  variants: {},
  defaultVariants: {},
});

/** The metadata tooltip over the file name badge; same glass background as the badge. */
export const carouselBadgeTooltipStyle = defineSlotStyle({
  slot: "carousel-badge-tooltip",
  base: "bg-[rgba(20,22,30,.62)] backdrop-blur-[8px] text-white text-(length:--fs-badge) leading-[1.5] py-[7px] px-[11px] rounded text-left font-(--fw-medium) tracking-[.01em] opacity-0 group-hover:opacity-100 transition-[opacity,transform]",
  variants: {},
  defaultVariants: {},
});

/** The tooltip title. */
export const carouselBadgeTitleStyle = defineSlotStyle({
  slot: "carousel-badge-title",
  base: "font-mono font-semibold text-white mb-[3px] text-(length:--fs-xs) leading-(--lh-xs) opacity-75 tracking-[.04em] uppercase",
  variants: {},
  defaultVariants: {},
});

/** One metadata row in the tooltip. */
export const carouselBadgeRowStyle = defineSlotStyle({
  slot: "carousel-badge-row",
  base: "gap-[6px] font-mono text-(length:--fs-xs) text-white/90 tabular-nums leading-[1.5]",
  variants: {},
  defaultVariants: {},
});

/** The label of a metadata row. */
export const carouselBadgeLabelStyle = defineSlotStyle({
  slot: "carousel-badge-label",
  base: "text-white/60 uppercase tracking-[.06em] text-(length:--fs-3xs) leading-(--lh-3xs) font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The white card pill behind the actions, so they stay distinguishable from the image. */
export const carouselActionsStyle = defineSlotStyle({
  slot: "carousel-actions",
  base: "gap-[2px] rounded-md bg-card/95 px-1 py-1 shadow-sm backdrop-blur-sm",
  variants: {},
  defaultVariants: {},
});
