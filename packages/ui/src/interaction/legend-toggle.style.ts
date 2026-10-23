import { defineSlotStyle } from "../design/slot-style";

/** The row of series a chart's reader can switch on and off. */
export const legendToggleStyle = defineSlotStyle({
  slot: "legend-toggle",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** One series in the legend: its swatch and name, pressed while the series shows. */
export const legendToggleItemStyle = defineSlotStyle({
  slot: "legend-toggle-item",
  base: "gap-1.5 rounded-md px-2 py-1 text-xs text-foreground [transition:opacity_var(--dur-fast)_var(--ease),background-color_var(--dur-fast)_var(--ease)] hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  variants: {
    shown: { true: "", false: "opacity-45 [&>[data-swatch]]:bg-transparent" },
  },
  defaultVariants: { shown: true },
});

/** The colour swatch beside a series name. */
export const legendToggleSwatchStyle = defineSlotStyle({
  slot: "legend-toggle-swatch",
  base: "size-2.5 rounded-sm border-2 border-[var(--swatch)] bg-[var(--swatch)]",
  variants: {
    fill: {
      solid: "",
      hatch: "bg-[repeating-linear-gradient(45deg,var(--swatch)_0_2px,color-mix(in_oklch,var(--swatch)_45%,var(--card))_2px_3.5px)]",
      outline: "bg-transparent [border-style:dashed]",
      dot: "rounded-full",
    },
  },
  defaultVariants: { fill: "solid" },
});
