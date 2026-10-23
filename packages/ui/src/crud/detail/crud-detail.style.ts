import { defineSlotStyle } from "../../design/slot-style";

/**
 * Header, body and footer share one horizontal padding so their edges stay aligned. Side panels
 * sit flush to the panel width (the enclosing `ListDetail.Detail` already insets from the
 * divider); dialogs keep an inner gutter.
 */
const dialogGutter = { true: "px-5", false: "" };

/** The strip above a detail panel that holds its header and the close button. */
export const crudDetailHeaderStyle = defineSlotStyle({
  slot: "crud-detail-header",
  as: "part",
  base: "border-b pb-2",
  variants: { dialog: { true: "px-5 pt-3", false: "" } },
  defaultVariants: { dialog: false },
});

/** The scrolling body of a detail panel. */
export const crudDetailBodyStyle = defineSlotStyle({
  slot: "crud-detail-body",
  base: "",
  variants: { dialog: dialogGutter },
  defaultVariants: { dialog: false },
});

/** The stack of sections inside the body. */
export const crudDetailContentStyle = defineSlotStyle({
  slot: "crud-detail-content",
  as: "part",
  base: "py-2",
  variants: {},
  defaultVariants: {},
});

/** The veil drawn over the panel while it loads. */
export const crudDetailLoadingStyle = defineSlotStyle({
  slot: "crud-detail-loading",
  base: "rounded-md bg-background/60 duration-150",
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
  base: "pt-4 pb-2",
  variants: {},
  defaultVariants: {},
});

/** The footer area below the body. */
export const crudDetailFooterStyle = defineSlotStyle({
  slot: "crud-detail-footer",
  base: "",
  variants: { dialog: { true: "px-5 pb-3", false: "" } },
  defaultVariants: { dialog: false },
});

/** The field area of a detail section. */
export const crudDetailSectionBodyStyle = defineSlotStyle({
  slot: "crud-detail-section-body",
  as: "part",
  base: "pl-2",
  variants: {
    // A single-column body keeps the tight rhythm a stacked section reads at. The column gap is
    // the one a field draws between its own label and value, so the two agree and the tracks
    // measure to the labels exactly.
    single: { true: "gap-x-3 gap-y-1", false: "" },
  },
  defaultVariants: { single: false },
});

/** A row of actions under a detail panel. */
export const crudDetailActionsStyle = defineSlotStyle({
  slot: "crud-detail-actions",
  as: "part",
  base: "border-t pt-2",
  // `spread` pushes the first action to the far start, the rest to the end.
  variants: { spread: { true: "[&>*:first-child]:mr-auto", false: "" } },
  defaultVariants: { spread: false },
});

/** The two-tier footer block. */
export const crudDetailActionFooterStyle = defineSlotStyle({
  slot: "crud-detail-action-footer",
  as: "part",
  base: "border-t pt-2",
  variants: {},
  defaultVariants: {},
});

/** The standard row beneath the domain-action tier; a divider separates the two. */
export const crudDetailActionFooterRowStyle = defineSlotStyle({
  slot: "crud-detail-action-footer-row",
  as: "part",
  base: "border-t pt-2",
  variants: {},
  defaultVariants: {},
});
