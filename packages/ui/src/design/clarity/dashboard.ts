/** Clarity overrides for figure cards, charts, legends, the period control. */
export const dashboardSlots: Record<string, string> = {
  "segmented-control": "rounded-[calc(var(--radius-control)+2px)] bg-[var(--surface-3)]",
  "segmented-control-item": "h-7 text-(length:--fs-control) leading-(--lh-control) font-(--fw-strong) hover:text-foreground",
  "segmented-control-thumb": "rounded-[var(--radius-control)] bg-card",
  "legend-toggle": "gap-0.5",
  "legend-toggle-item": "h-6 gap-1.5 rounded-[var(--radius-control)] px-2 py-0 text-(length:--fs-badge) leading-(--lh-badge) text-secondary-foreground",
  "legend-toggle-item shown=false": "[&>[data-swatch]]:bg-transparent [&>[data-swatch]]:shadow-[inset_0_0_0_1.5px_var(--muted-2)] [&>[data-swatch]]:border-0",
  "legend-toggle-swatch": "size-2 rounded-[var(--radius-2xs)] border-0",
  "legend-toggle-swatch fill=outline": "bg-transparent shadow-[inset_0_0_0_1.5px_var(--swatch)]",
  "legend-toggle-swatch fill=dot": "rounded-full",
  "plot-grid base=true": "stroke-[var(--border-strong)]",
  "plot-column-hit hot=true": "fill-[var(--hover-bg)]",
  "plot-crosshair": "stroke-[var(--border-strong)]",
  "plot-tooltip": "border-0 rounded-[var(--radius-control)] bg-[var(--popover-strong)] text-(length:--fs-badge) leading-(--lh-badge) text-[var(--popover-strong-foreground)] shadow-[var(--shadow-3)]",
  "plot-skeleton-bar": "rounded-[calc(var(--radius-control)-2px)] bg-[linear-gradient(90deg,var(--surface-3),var(--shimmer),var(--surface-3))] bg-[length:200%_100%]",
};
