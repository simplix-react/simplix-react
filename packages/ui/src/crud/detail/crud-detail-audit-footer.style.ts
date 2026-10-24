import { defineSlotStyle } from "../../design/slot-style";

/**
 * The audit block that closes a record (the same block in a detail and a form footer): a hairline
 * above, the id chip at the start, each stamp as its label and value at the end; the stamps wrap
 * under the id when the panel is narrow.
 */
export const crudDetailAuditFooterStyle = defineSlotStyle({
  slot: "crud-detail-audit-footer",
  base: "flex-wrap gap-x-3 gap-y-1 border-t px-0 py-2.5 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The button that shows the short id and copies the full one. */
export const crudDetailAuditIdStyle = defineSlotStyle({
  slot: "crud-detail-audit-id",
  // A chip that copies the full id on press; the shared press and focus.
  base:
    "-ml-1 gap-1 rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-left whitespace-nowrap [&>span]:shrink-0 [&>span]:overflow-visible hover:bg-[var(--surface-3)] hover:text-foreground transition-[color,background-color,scale] duration-[var(--dur-fast)] active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The copied-confirmation check beside the id. */
export const crudDetailAuditCopiedStyle = defineSlotStyle({
  slot: "crud-detail-audit-copied",
  base: "text-green-600",
  variants: {},
  defaultVariants: {},
});

/** The tooltip that shows the full id. */
export const crudDetailAuditTooltipStyle = defineSlotStyle({
  slot: "crud-detail-audit-tooltip",
  // Entry motion is tw-animate-css.
  base: "rounded-md border bg-popover px-2.5 py-1.5 text-popover-foreground shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** The full id line in the tooltip. */
export const crudDetailAuditTooltipIdStyle = defineSlotStyle({
  slot: "crud-detail-audit-tooltip-id",
  base: "whitespace-nowrap font-mono text-[11px]",
  variants: {},
  defaultVariants: {},
});

/** The copy hint line in the tooltip. */
export const crudDetailAuditTooltipHintStyle = defineSlotStyle({
  slot: "crud-detail-audit-tooltip-hint",
  base: "text-muted-foreground text-[11px]",
  variants: {},
  defaultVariants: {},
});

/** The right-aligned group of created and modified stamps. */
export const crudDetailAuditDatesStyle = defineSlotStyle({
  slot: "crud-detail-audit-dates",
  base: "ml-auto flex-wrap justify-end gap-x-4 gap-y-0.5",
  variants: {},
  defaultVariants: {},
});

/** One created or modified stamp. */
export const crudDetailAuditDateStyle = defineSlotStyle({
  slot: "crud-detail-audit-date",
  // Each stamp leads with its own label (the element's title), not an icon.
  base: "gap-1.5 whitespace-nowrap tabular-nums [&>svg]:hidden before:text-[var(--muted-2)] before:content-[attr(title)]",
  variants: {},
  defaultVariants: {},
});
