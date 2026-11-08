/** Clarity overrides for the command palette and the chrome parts the framework draws. */
export const commandSlots: Record<string, string> = {
  command: "rounded-none bg-popover",
  // The search row draws the keyboard ring inward while the field holds focus, as every other control of the
  // popover that carries it does: the popover's edge clips an outward halo, and a caret alone does not tell the
  // keyboard where it is. The field takes the ring through its row, which also holds the magnifier.
  "command-input-wrapper": "h-13 gap-2.5 border-[var(--border)] px-4 focus-within:shadow-[var(--focus-halo-inset)]",
  "command-input-icon": "mr-0 size-[18px] text-muted-foreground opacity-100",
  "command-input": "h-13 py-0 text-(length:--fs-title-sm) leading-(--lh-title-sm)",
  "command-empty": "p-8 text-(length:--fs-cell) leading-(--lh-cell) text-muted-foreground",
  "command-group":
    "p-0 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:text-(length:--fs-badge) leading-(--lh-badge) [&_[cmdk-group-heading]]:font-semibold",
  "command-separator": "bg-[var(--border)]",
  "command-item":
    "min-h-[38px] gap-2.5 rounded-[var(--radius-control)] px-2.5 py-0 text-(length:--fs-cell) leading-(--lh-cell) data-[selected=true]:bg-[var(--surface-3)] data-[selected=true]:text-foreground [&_svg]:text-muted-foreground data-[selected=true]:[&_svg]:text-foreground",
};
