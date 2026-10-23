import { defineSlotStyle } from "../../design/slot-style";

/** The audit footer strip under a detail panel. */
export const crudDetailAuditFooterStyle = defineSlotStyle({
  slot: "crud-detail-audit-footer",
  base: "gap-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The button that shows the short id and copies the full one. */
export const crudDetailAuditIdStyle = defineSlotStyle({
  slot: "crud-detail-audit-id",
  base: "gap-1.5 font-mono text-left hover:text-foreground transition-colors",
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
  base: "rounded-md border bg-popover px-3 py-1.5 text-popover-foreground shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** The full id line in the tooltip. */
export const crudDetailAuditTooltipIdStyle = defineSlotStyle({
  slot: "crud-detail-audit-tooltip-id",
  base: "font-mono text-[11px]",
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
  base: "ml-auto gap-3",
  variants: {},
  defaultVariants: {},
});

/** One created or modified stamp. */
export const crudDetailAuditDateStyle = defineSlotStyle({
  slot: "crud-detail-audit-date",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});
