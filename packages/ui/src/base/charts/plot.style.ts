import { defineSlotStyle } from "../../design/slot-style";

/** The box a hand-drawn plot sits in: the drawing, and the skeleton over it while it loads. */
export const plotStyle = defineSlotStyle({
  slot: "plot",
  base: "rounded-md outline-none [&>svg]:transition-opacity [&>svg]:duration-[var(--dur-base)] [&>svg]:ease-[var(--ease)] focus-visible:shadow-[var(--focus-halo)] focus-visible:outline-none",
  variants: {
    loading: { true: "[&>svg]:opacity-0", false: "" },
  },
  defaultVariants: { loading: false },
});

/** A horizontal rule at one value of the axis; the baseline is drawn solid. */
export const plotGridStyle = defineSlotStyle({
  slot: "plot-grid",
  base: "stroke-border [stroke-width:1]",
  variants: {
    base: { true: "", false: "[stroke-dasharray:2_3]" },
  },
  defaultVariants: { base: false },
});

/** A value or category written on an axis; the highlighted category is drawn in the text colour. */
export const plotAxisStyle = defineSlotStyle({
  slot: "plot-axis",
  base: "fill-muted-foreground text-(length:--fs-label) leading-(--lh-label) tabular-nums",
  variants: {
    highlighted: { true: "fill-foreground font-semibold", false: "" },
  },
  defaultVariants: { highlighted: false },
});

/** The column a pointer hovers to read one category. */
export const plotColumnHitStyle = defineSlotStyle({
  slot: "plot-column-hit",
  base: "fill-transparent",
  variants: {
    hot: { true: "fill-accent", false: "" },
  },
  defaultVariants: { hot: false },
});

/** One segment of a stacked column, filled by its series. */
export const plotBarStyle = defineSlotStyle({
  slot: "plot-bar",
  base: "[transition:opacity_var(--dur-fast)_var(--ease),transform_var(--dur-slow)_var(--ease),y_var(--dur-slow)_var(--ease),height_var(--dur-slow)_var(--ease)]",
  variants: {
    fill: {
      solid: "fill-[var(--series)]",
      hatch: "",
      outline: "fill-transparent stroke-[var(--series)] [stroke-width:1.25] [stroke-dasharray:3_2]",
    },
    dimmed: { true: "opacity-40", false: "" },
  },
  defaultVariants: { fill: "solid", dimmed: false },
});

/** A series drawn as a line. */
export const plotLineStyle = defineSlotStyle({
  slot: "plot-line",
  base: "fill-none stroke-[var(--series)] [stroke-linecap:round] [stroke-linejoin:round] [transition:opacity_var(--dur-base)_var(--ease),stroke-dashoffset_var(--dur-slow)_var(--ease)]",
  variants: {
    weight: { strong: "[stroke-width:2]", soft: "[stroke-width:1.5]" },
    shown: { true: "", false: "opacity-0" },
  },
  defaultVariants: { weight: "strong", shown: true },
});

/** The tint under the leading line. */
export const plotAreaStyle = defineSlotStyle({
  slot: "plot-area",
  base: "[transition:opacity_var(--dur-base)_var(--ease)]",
  variants: {
    shown: { true: "", false: "opacity-0" },
  },
  defaultVariants: { shown: true },
});

/** A reading on a line, shown while the pointer is on its category. */
export const plotPointStyle = defineSlotStyle({
  slot: "plot-point",
  base: "fill-card stroke-[var(--series)] [stroke-width:1.75] [transition:opacity_var(--dur-fast)_var(--ease)]",
  variants: {
    hot: { true: "opacity-100", false: "opacity-0" },
  },
  defaultVariants: { hot: false },
});

/** The vertical rule at the category the pointer is on. */
export const plotCrosshairStyle = defineSlotStyle({
  slot: "plot-crosshair",
  base: "stroke-border [transition:opacity_var(--dur-fast)_var(--ease)]",
  variants: {
    on: { true: "opacity-100", false: "opacity-0" },
  },
  defaultVariants: { on: false },
});

/** The stand-in columns drawn while the plot's data is on its way. */
export const plotSkeletonStyle = defineSlotStyle({
  slot: "plot-skeleton",
  base: "gap-[6%] transition-opacity duration-[var(--dur-base)] starting:opacity-0",
  variants: {},
  defaultVariants: {},
});

/** One stand-in column. */
export const plotSkeletonBarStyle = defineSlotStyle({
  slot: "plot-skeleton-bar",
  base: "rounded-sm bg-muted bg-[linear-gradient(90deg,var(--muted),var(--shimmer),var(--muted))] bg-[length:200%_100%] animate-skeleton-shine motion-reduce:animate-none",
  variants: {},
  defaultVariants: {},
});

/** The reading that follows the pointer over a plot. */
export const plotTooltipStyle = defineSlotStyle({
  slot: "plot-tooltip",
  base: "gap-[3px] [transition:opacity_var(--dur-base)_var(--ease-spring),translate_var(--dur-base)_var(--ease-spring)] starting:opacity-0 starting:-translate-x-1 rounded-md bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md border",
  variants: {},
  defaultVariants: {},
});

/** One line of the tooltip: a swatch, a series name and its value. */
export const plotTooltipRowStyle = defineSlotStyle({
  slot: "plot-tooltip-row",
  base: "gap-1.5 tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The swatch of a series in the tooltip, drawn the way its marks are. */
export const plotSwatchStyle = defineSlotStyle({
  slot: "plot-swatch",
  base: "rounded-[var(--radius-2xs)] bg-[var(--series)]",
  variants: {
    fill: {
      solid: "",
      hatch: "bg-[repeating-linear-gradient(45deg,var(--series)_0_2px,color-mix(in_oklch,var(--series)_45%,var(--card))_2px_3.5px)]",
      outline: "bg-transparent shadow-[inset_0_0_0_1.5px_var(--series)]",
      dot: "rounded-full",
    },
  },
  defaultVariants: { fill: "solid" },
});
