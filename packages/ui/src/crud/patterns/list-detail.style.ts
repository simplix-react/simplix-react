import { defineSlotStyle } from "../../design/slot-style";

/** The grid that holds the list, the divider and the detail of a panel-shaped list-detail. */
export const crudListDetailRootStyle = defineSlotStyle({
  slot: "crud-list-detail-root",
  base: "",
  variants: {
    // The columns animate when the detail opens or closes, but not while the divider is dragged.
    dragging: {
      true: "",
      false: "md:transition-[grid-template-columns] md:duration-[var(--dur-slow)] md:ease-[var(--ease)]",
    },
  },
  defaultVariants: { dragging: false },
});

/**
 * The drag handle between the list and the detail. The detail is a framed card, so the handle draws
 * no line at rest: a thin rule and a grip appear on hover, press and keyboard focus.
 */
export const crudListDetailDividerStyle = defineSlotStyle({
  slot: "crud-list-detail-divider",
  base:
    "relative bg-transparent bg-clip-content hover:bg-primary/30 active:bg-primary/50 focus-visible:bg-primary/50 focus-visible:outline-none focus-visible:before:shadow-[var(--focus-halo)] transition-[padding,opacity,background-color] duration-[var(--dur-base)] ease-[var(--ease)] before:absolute before:top-1/2 before:left-1/2 before:h-9 before:w-[5px] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:border before:border-[var(--border-strong)] before:bg-card before:opacity-0 before:shadow-[var(--shadow-1)] before:transition-opacity before:duration-[var(--dur-fast)] before:content-[''] hover:before:opacity-100 focus-visible:before:opacity-100 active:before:opacity-100",
  variants: {
    collapsed: { true: "opacity-0 px-0", false: "px-[7px]" },
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

/**
 * The detail column of a panel-shaped list-detail: a framed card that slides 16px from the divider
 * side as it fades in.
 */
export const crudListDetailDetailStyle = defineSlotStyle({
  slot: "crud-list-detail-detail",
  base: "md:transition-[opacity,translate] md:duration-[var(--dur-slow)] md:ease-[var(--ease-spring)] motion-reduce:md:translate-x-0",
  variants: {
    open: { true: "md:opacity-100 md:pl-0 md:translate-x-0 rounded-lg border bg-card", false: "md:opacity-0 md:translate-x-4" },
  },
  defaultVariants: { open: false },
});

/**
 * Wraps the content of a detail that opens as a drawer.
 *
 * <p>The drawer is the shared `SheetContent`, whose own slot is fixed, so the slot padding is
 * written as rules against the detail's slots inside it.
 */
export const crudListDetailDrawerBodyStyle = defineSlotStyle({
  slot: "crud-list-detail-drawer-body",
  // The same 16px inset as the panel.
  base: "[&_[data-crud-slot=header]]:px-4 [&_[data-crud-slot=body]]:px-0 [&_[data-crud-slot=body]>*]:px-4 [&_[data-crud-slot=footer]]:px-0 [&_[data-crud-slot=footer]>*]:px-4",
  variants: {},
  defaultVariants: {},
});

/** The drawer that holds the detail: no gap of its own; the detail's header and footer pad it. */
export const crudListDetailDrawerStyle = defineSlotStyle({
  slot: "crud-list-detail-drawer",
  as: "part",
  base: "gap-0 py-0",
  variants: {},
  defaultVariants: {},
});
