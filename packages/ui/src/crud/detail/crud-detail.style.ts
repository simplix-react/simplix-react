import { defineSlotStyle } from "../../design/slot-style";

/**
 * Header, body and footer share one 16px horizontal inset so their edges stay aligned; a dialog
 * keeps its wider gutter. Every design draws the same insets, placement and motion; a design
 * changes colour, type, radius and surface only.
 */
const dialogGutter = { true: "px-5", false: "" };

/** The strip above a detail panel that holds its header and the close button. */
export const crudDetailHeaderStyle = defineSlotStyle({
  slot: "crud-detail-header",
  as: "part",
  // No rule at rest; a soft edge appears once the body has scrolled under the header. The close
  // control is a 32px corner button, the same in every panel and overlay.
  base:
    "px-4 pt-4 pb-3 transition-shadow duration-[var(--dur-base)] ease-[var(--ease)] [&_[data-slot=button][data-size=icon-xs]]:size-8 [&_[data-slot=button][data-size=icon-xs]]:border-0 [&_[data-slot=button][data-size=icon-xs]]:bg-transparent [&_[data-slot=button][data-size=icon-xs]]:text-muted-foreground [&_[data-slot=button][data-size=icon-xs]]:shadow-none [&_[data-slot=button][data-size=icon-xs]:focus-visible]:shadow-[var(--focus-halo)] [&_[data-slot=button][data-size=icon-xs]:hover]:bg-[var(--hover-bg-strong)] [&_[data-slot=button][data-size=icon-xs]:hover]:text-foreground [&_[data-slot=button][data-size=icon-xs]_svg]:!size-4",
  variants: {
    dialog: { true: "px-5 pt-3", false: "" },
    // The body has scrolled under the header.
    scrolled: { true: "shadow-[0_8px_12px_-12px_oklch(0_0_0/0.35)]", false: "" },
  },
  defaultVariants: { dialog: false, scrolled: false },
});

/** The scrolling body of a detail panel. */
export const crudDetailBodyStyle = defineSlotStyle({
  slot: "crud-detail-body",
  // Tabs: a quiet hover ground under each trigger. Detail list rows: inset, hover one surface step,
  // the shared focus halo.
  base:
    "px-4 [&_[data-slot=tabs-list][data-variant=underline]]:mb-1 [&_[data-slot=tabs-list][data-variant=underline]]:gap-1 [&_[data-slot=tabs-trigger][data-variant=underline]]:px-2.5 [&_[data-slot=tabs-trigger][data-variant=underline]]:transition-[color,background-color,border-color] [&_[data-slot=tabs-trigger][data-variant=underline]]:duration-[var(--dur-fast)] [&_[data-slot=tabs-trigger][data-variant=underline]:hover]:bg-[var(--hover-bg)] " +
    "[&_[data-slot=detail-list-row]]:px-3 [&_[data-slot=detail-list-row]]:transition-colors [&_[data-slot=detail-list-row]]:duration-[var(--dur-fast)] [&_[data-slot=detail-list-row]:hover]:bg-[var(--surface-2)] [&_[data-slot=detail-list-row]:focus-visible]:ring-0 [&_[data-slot=detail-list-row]:focus-visible]:shadow-[var(--focus-halo)]",
  variants: { dialog: dialogGutter },
  defaultVariants: { dialog: false },
});

/** The stack of sections inside the body. */
export const crudDetailContentStyle = defineSlotStyle({
  slot: "crud-detail-content",
  as: "part",
  // Sections: 12px from a title to its fields, 20px between sections.
  base:
    "py-1 [&_[data-slot=section-shell][data-variant=flat]]:!gap-3 [&_[data-slot=section-shell][data-variant=flat]]:!py-5 [&_[data-slot=section-shell][data-variant=flat]:first-child]:!pt-2 [&_[data-slot=section-shell][data-variant=flat]:last-child]:!pb-1",
  variants: {},
  defaultVariants: {},
});

/** The veil drawn over the panel while it loads. */
export const crudDetailLoadingStyle = defineSlotStyle({
  slot: "crud-detail-loading",
  base: "rounded-md bg-background/60 duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** The spinner inside the loading veil. */
export const crudDetailSpinnerStyle = defineSlotStyle({
  slot: "crud-detail-spinner",
  base: "animate-spin rounded-full border-2 border-primary border-t-transparent",
  variants: {},
  defaultVariants: {},
});

/** The wrapper around the audit footer. */
export const crudDetailAuditStyle = defineSlotStyle({
  slot: "crud-detail-audit",
  // At the foot of the body when the record is short, after the last section when it scrolls.
  base: "mt-auto px-0 pt-3 pb-0",
  variants: {},
  defaultVariants: {},
});

/** The footer area below the body. */
export const crudDetailFooterStyle = defineSlotStyle({
  slot: "crud-detail-footer",
  base: "transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    dialog: { true: "px-5 pb-3", false: "" },
    // More of the body lies below the footer: a soft edge rises above it.
    overflow: { true: "shadow-[0_-8px_12px_-12px_oklch(0_0_0/0.35)]", false: "" },
  },
  defaultVariants: { dialog: false, overflow: false },
});

/** The field area of a detail section. */
export const crudDetailSectionBodyStyle = defineSlotStyle({
  slot: "crud-detail-section-body",
  as: "part",
  // The field grid: label over value, 24px between columns, 16px between rows, 4px from label to
  // value, no column rules (a rule drawn per row breaks between rows and leaves a lone last field
  // half-ruled). Values sit on a 22px line so text, badges and copy controls align; long values
  // wrap. A lone last field keeps its column. The empty value is the shared dash, quiet.
  base:
    "pl-0 !gap-x-6 !gap-y-4 [&>.grid-column-rule]:!ml-0 [&>.grid-column-rule]:!border-l-0 [&>.grid-column-rule]:!pl-0 [&_[data-slot=field-detail-wrapper]]:!flex [&_[data-slot=field-detail-wrapper]]:!flex-col [&_[data-slot=field-detail-wrapper]]:!gap-1 [&_[data-slot=field-detail-wrapper]]:!py-0 [&_[data-slot=field-detail-wrapper]]:min-w-0 [&_[data-slot=field-detail-value]]:flex [&_[data-slot=field-detail-value]]:min-h-[22px] [&_[data-slot=field-detail-value]]:min-w-0 [&_[data-slot=field-detail-value]]:flex-wrap [&_[data-slot=field-detail-value]]:items-center [&_[data-slot=field-detail-value]]:gap-1.5 [&_[data-slot=field-detail-value]]:break-words [&_[data-slot=empty-value]]:font-normal [&_[data-slot=empty-value]]:text-[var(--muted-2)]",
  variants: {
    // One column or two: the field grid's gaps are the same in both.
    single: { true: "", false: "" },
  },
  defaultVariants: { single: false },
});

/** A row of actions under a detail panel. */
export const crudDetailActionsStyle = defineSlotStyle({
  slot: "crud-detail-actions",
  as: "part",
  // Inset as the body is, 12px above and below the buttons.
  base: "border-t px-4 pt-3 pb-3",
  // `spread` pushes the first action to the far start, the rest to the end.
  variants: { spread: { true: "[&>*:first-child]:mr-auto", false: "" } },
  defaultVariants: { spread: false },
});

/** The two-tier footer block. */
export const crudDetailActionFooterStyle = defineSlotStyle({
  slot: "crud-detail-action-footer",
  as: "part",
  base: "border-t px-4 pt-3 pb-3",
  variants: {},
  defaultVariants: {},
});

/** The standard row beneath the domain-action tier; a divider separates the two. */
export const crudDetailActionFooterRowStyle = defineSlotStyle({
  slot: "crud-detail-action-footer-row",
  as: "part",
  // 12px under the divider, as the footer leaves 12px under the buttons.
  base: "border-t pt-3",
  variants: {},
  defaultVariants: {},
});

/** The footer's close or back button; `redundant` when the header already draws a close control. */
export const crudDetailCloseActionStyle = defineSlotStyle({
  slot: "crud-detail-close-action",
  as: "part",
  base: "",
  // The header already holds the close control, so the footer's second 닫기 is hidden.
  variants: { redundant: { true: "hidden", false: "" } },
  defaultVariants: { redundant: false },
});

/** The end group of the standard actions: delete, the record's own verbs, edit. */
export const crudDetailActionsGroupStyle = defineSlotStyle({
  slot: "crud-detail-actions-group",
  as: "part",
  // A destructive verb (a destructive button, or the standard delete) stands alone at the far
  // start; every other verb sits at the end, the primary one last.
  base: "ml-auto flex-1 justify-end [&>[data-variant=destructive]]:order-first [&>[data-variant=destructive]]:mr-auto [&>[data-action=delete]]:order-first [&>[data-action=delete]]:mr-auto",
  variants: {},
  defaultVariants: {},
});
