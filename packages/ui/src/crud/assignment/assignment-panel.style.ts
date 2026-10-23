import { defineSlotStyle } from "../../design/slot-style";

/**
 * The body of an assignment panel, which holds a table or a chip list.
 *
 * <p>The panel is itself a bordered card, so the table card inside it gives up its own border and
 * corners. The table card is the shared `Card`, whose own slot is fixed, so this is written as a
 * rule against it.
 */
export const crudAssignmentPanelBodyStyle = defineSlotStyle({
  slot: "crud-assignment-panel-body",
  base: "[&_div.rounded-lg.border]:border-0 [&_div.rounded-lg.border]:rounded-none",
  variants: {},
  defaultVariants: {},
});

/**
 * The title row of an assignment panel.
 *
 * <p>The title is the shared `Text`, whose own slot is fixed, so its weight is written as a rule
 * against it.
 */
export const crudAssignmentPanelHeaderStyle = defineSlotStyle({
  slot: "crud-assignment-panel-header",
  base: "gap-4 border-b bg-muted/50 px-4 py-2 [&_[data-slot=text]]:font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The asterisk after the title of a required panel. */
export const crudAssignmentPanelRequiredStyle = defineSlotStyle({
  slot: "crud-assignment-panel-required",
  base: "text-destructive ml-0.5",
  variants: {},
  defaultVariants: {},
});

/**
 * Wraps the empty-state notice of a panel.
 *
 * <p>The notice is the shared `EmptyState`, whose own slot is fixed, so its frame is dropped by a
 * rule against its root.
 */
export const crudAssignmentPanelEmptyStyle = defineSlotStyle({
  slot: "crud-assignment-panel-empty",
  base: "[&>div]:border-0 [&>div]:py-10",
  variants: {},
  defaultVariants: {},
});

/** The row that holds the chips of a panel. */
export const crudAssignmentPanelChipsStyle = defineSlotStyle({
  slot: "crud-assignment-panel-chips",
  base: "gap-2 px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** One chip of a panel. */
export const crudAssignmentPanelChipStyle = defineSlotStyle({
  slot: "crud-assignment-panel-chip",
  base: "gap-1 rounded-md border bg-card px-3",
  variants: {},
  defaultVariants: {},
});

/** The button that removes a chip. */
export const crudAssignmentPanelChipRemoveStyle = defineSlotStyle({
  slot: "crud-assignment-panel-chip-remove",
  base: "ml-1 rounded-sm text-muted-foreground hover:text-foreground",
  variants: {},
  defaultVariants: {},
});
