import { defineSlotStyle } from "../../design/slot-style";

/**
 * Horizontal padding pushed down into the slots of a detail that opens over the list.
 *
 * <p>The header and footer rules of CrudDetail and CrudForm have to span the full width rather
 * than stopping inside a gutter, so the container carries the padding and the slots drop theirs.
 * Body and footer slots carry their own panel padding; it is zeroed here so the pushed padding
 * does not stack.
 */
const OVERLAY_SLOT_PADDING =
  "[&_[data-crud-slot=header]]:px-6 [&_[data-crud-slot=body]]:px-0 [&_[data-crud-slot=body]>*]:px-6 [&_[data-crud-slot=footer]]:px-0 [&_[data-crud-slot=footer]>*]:px-6";

/** The grid that holds the list, the divider and the detail of a panel-shaped list-detail. */
export const crudListDetailRootStyle = defineSlotStyle({
  slot: "crud-list-detail-root",
  base: "",
  variants: {
    // The columns animate when the detail opens or closes, but not while the divider is dragged.
    dragging: {
      true: "",
      false: "md:transition-[grid-template-columns] md:duration-300 md:ease-in-out",
    },
  },
  defaultVariants: { dragging: false },
});

/** The drag handle between the list and the detail. */
export const crudListDetailDividerStyle = defineSlotStyle({
  slot: "crud-list-detail-divider",
  base: "bg-border bg-clip-content hover:bg-primary/30 active:bg-primary/50 transition-[padding,opacity] duration-300 ease-in-out",
  variants: {
    collapsed: { true: "opacity-0 px-0", false: "px-2" },
  },
  defaultVariants: { collapsed: false },
});

/** The list column. */
export const crudListDetailListStyle = defineSlotStyle({
  slot: "crud-list-detail-list",
  base: "gap-3",
  variants: {
    // Beside an open detail the list leaves room between itself and the divider.
    beside: { true: "md:pr-4", false: "" },
  },
  defaultVariants: { beside: false },
});

/** The detail column of a panel-shaped list-detail. */
export const crudListDetailDetailStyle = defineSlotStyle({
  slot: "crud-list-detail-detail",
  base: "md:pl-2 md:transition-opacity md:duration-300 md:ease-in-out",
  variants: {
    open: { true: "md:opacity-100", false: "md:opacity-0" },
  },
  defaultVariants: { open: false },
});

/** The backdrop behind a detail that opens as a dialog. */
export const crudListDetailOverlayStyle = defineSlotStyle({
  slot: "crud-list-detail-overlay",
  base: "bg-black/80",
  variants: {},
  defaultVariants: {},
});

/** A detail that opens as a centred dialog. */
export const crudListDetailDialogStyle = defineSlotStyle({
  slot: "crud-list-detail-dialog",
  base: `rounded-lg border bg-background py-4 shadow-lg ${OVERLAY_SLOT_PADDING}`,
  variants: {},
  defaultVariants: {},
});

/**
 * Wraps the content of a detail that opens as a drawer.
 *
 * <p>The drawer is the shared `SheetContent`, whose own slot is fixed, so the slot padding is
 * written as rules against the detail's slots inside it.
 */
export const crudListDetailDrawerBodyStyle = defineSlotStyle({
  slot: "crud-list-detail-drawer-body",
  base: OVERLAY_SLOT_PADDING,
  variants: {},
  defaultVariants: {},
});

/** The drawer that holds the detail: no gap of its own, padded top and bottom. */
export const crudListDetailDrawerStyle = defineSlotStyle({
  slot: "crud-list-detail-drawer",
  as: "part",
  base: "gap-0 py-4",
  variants: {},
  defaultVariants: {},
});
