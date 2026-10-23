import { defineSlotStyle } from "../../design/slot-style";

/** The card that explains why a list is empty (error, unavailable, no filter match, no search match). */
export const crudListReasonStyle = defineSlotStyle({
  slot: "crud-list-reason",
  base: "px-6 py-16 text-center",
  variants: { bordered: { true: "rounded-lg border", false: "" } },
  defaultVariants: { bordered: true },
});

/** The round badge around the reason's icon. */
export const crudListReasonIconStyle = defineSlotStyle({
  slot: "crud-list-reason-icon",
  base: "mb-3 rounded-full p-4",
  variants: {
    tone: {
      destructive: "bg-destructive/10 text-destructive",
      muted: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { tone: "muted" },
});

/** The reason's headline. */
export const crudListReasonTitleStyle = defineSlotStyle({
  slot: "crud-list-reason-title",
  base: "text-base font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The reason's explanation. */
export const crudListReasonDescriptionStyle = defineSlotStyle({
  slot: "crud-list-reason-description",
  base: "mt-1 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The plain message box shown in place of rows. */
export const crudListEmptyMessageStyle = defineSlotStyle({
  slot: "crud-list-empty-message",
  base: "rounded-lg border text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The bar above a list: filters, search, create. */
export const crudListToolbarStyle = defineSlotStyle({
  slot: "crud-list-toolbar",
  as: "part",
  base: "rounded-lg border bg-card p-3",
  variants: {},
  defaultVariants: {},
});

/** The sort arrow beside a sortable column header; an unsorted column draws it faint. */
export const crudListSortIconStyle = defineSlotStyle({
  slot: "crud-list-sort-icon",
  base: "ml-1",
  variants: { sorted: { true: "opacity-100", false: "opacity-30" } },
  defaultVariants: { sorted: false },
});

/** The button a sortable column header is. */
export const crudListSortButtonStyle = defineSlotStyle({
  slot: "crud-list-sort-button",
  base: "font-semibold hover:text-foreground",
  variants: { sorted: { true: "text-foreground", false: "" } },
  defaultVariants: { sorted: false },
});

/** The asterisk that marks a required column. Same glyph and colour as a required field's. */
export const crudListRequiredMarkStyle = defineSlotStyle({
  slot: "crud-list-required-mark",
  base: "text-destructive ml-0.5",
  variants: {},
  defaultVariants: {},
});

/** The row holding the select-all checkbox above a card list. */
export const crudListSelectAllRowStyle = defineSlotStyle({
  slot: "crud-list-select-all-row",
  as: "part",
  base: "px-1",
  variants: {},
  defaultVariants: {},
});

/** The label of the select-all checkbox. */
export const crudListSelectAllStyle = defineSlotStyle({
  slot: "crud-list-select-all",
  base: "gap-2 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The wrapper that fades a card or table view in when the mode changes. */
export const crudListViewStyle = defineSlotStyle({
  slot: "crud-list-view",
  base: " duration-200",
  variants: {},
  defaultVariants: {},
});

/** The message shown in a card list that has no cards. */
export const crudListCardEmptyStyle = defineSlotStyle({
  slot: "crud-list-card-empty",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The title row of a card. */
export const crudListCardHeaderStyle = defineSlotStyle({
  slot: "crud-list-card-header",
  as: "part",
  base: "border-b px-2 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** The pager under a list. */
export const crudListPaginationStyle = defineSlotStyle({
  slot: "crud-list-pagination",
  base: "gap-2 border-t px-3.5 py-2.5",
  variants: {
    framed: { true: "bg-card", false: "bg-muted/60" },
    // Everything fits on one page, so the pager has nowhere to go; a design may leave it out.
    single: { true: "", false: "" },
  },
  defaultVariants: { framed: false, single: false },
});

/** The "rows per page" label. */
export const crudListPaginationLabelStyle = defineSlotStyle({
  slot: "crud-list-pagination-label",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The "page / total" text of a compact pager. */
export const crudListPageStatusStyle = defineSlotStyle({
  slot: "crud-list-page-status",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/** The gap mark between page numbers. */
export const crudListPageEllipsisStyle = defineSlotStyle({
  slot: "crud-list-page-ellipsis",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A pager button: previous, next, or a page number. */
export const crudListPageButtonStyle = defineSlotStyle({
  slot: "crud-list-page-button",
  base: "rounded-md border border-border bg-card text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
  variants: {
    numbered: { true: "px-2", false: "" },
    // The page being shown takes the primary colours; it comes after the base so it overrides
    // the border, background and text colours there.
    current: {
      true: "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      false: "",
    },
  },
  defaultVariants: { numbered: false, current: false },
});

/** The bar shown while rows are selected. */
export const crudListBulkActionsStyle = defineSlotStyle({
  slot: "crud-list-bulk-actions",
  as: "part",
  base: "rounded-md border bg-muted/50 px-4 py-2",
  variants: {},
  defaultVariants: {},
});

/** The selected-count text in the bulk bar. */
export const crudListBulkCountStyle = defineSlotStyle({
  slot: "crud-list-bulk-count",
  base: "text-sm font-medium",
  variants: {},
  defaultVariants: {},
});

/** The button that clears the selection. */
export const crudListBulkClearStyle = defineSlotStyle({
  slot: "crud-list-bulk-clear",
  base: "ml-auto text-sm text-muted-foreground hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** One action button in the bulk bar. Both variants read the same today; the attribute lets a design tell them apart. */
export const crudListBulkActionStyle = defineSlotStyle({
  slot: "crud-list-bulk-action",
  base: "rounded-md px-3 py-1.5 text-sm font-medium transition-colors text-foreground hover:bg-muted",
  variants: { variant: { default: "", destructive: "" } },
  defaultVariants: { variant: "default" },
});

/** The placeholder shown by `CrudList.Empty`. */
export const crudListEmptyStyle = defineSlotStyle({
  slot: "crud-list-empty",
  as: "part",
  base: "py-12",
  variants: {},
  defaultVariants: {},
});

/** The text of the empty placeholder. */
export const crudListEmptyTextStyle = defineSlotStyle({
  slot: "crud-list-empty-text",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The narrow header cell above the drag handles of a reorderable table. */
export const crudListHandleHeadStyle = defineSlotStyle({
  slot: "crud-list-handle-head",
  as: "part",
  base: "px-2",
  variants: {},
  defaultVariants: {},
});

/** The single cell that says a table has no rows. */
export const crudListEmptyCellStyle = defineSlotStyle({
  slot: "crud-list-empty-cell",
  as: "part",
  base: "text-center text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A record row of the table; a selected row is tinted, the open record less strongly. */
export const crudListRowStyle = defineSlotStyle({
  slot: "crud-list-row",
  as: "part",
  base: "",
  variants: {
    selected: { true: "bg-muted", false: "" },
    active: { true: "bg-muted/50", false: "" },
    // The row the keyboard stands on (j / k); Enter opens it and x selects it.
    focused: { true: "shadow-[inset_0_0_0_1.5px_var(--ring)]", false: "" },
  },
  defaultVariants: { selected: false, active: false, focused: false },
});

/** The row that heads a group of records; it is not a record, so it does not light on hover. */
export const crudListGroupRowStyle = defineSlotStyle({
  slot: "crud-list-group-row",
  as: "part",
  base: "hover:bg-transparent",
  variants: {},
  defaultVariants: {},
});

/** The cell that spans a group heading row. */
export const crudListGroupCellStyle = defineSlotStyle({
  slot: "crud-list-group-cell",
  as: "part",
  base: "bg-muted/40 py-1 text-xs font-semibold text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The page-size picker in the pagination bar. */
export const crudListPageSizeStyle = defineSlotStyle({
  slot: "crud-list-page-size",
  as: "part",
  base: "rounded-md border-border bg-card font-medium text-secondary-foreground",
  variants: {},
  defaultVariants: {},
});

/** How many records a group heading holds, beside its label. The classic design leaves it out. */
export const crudListGroupCountStyle = defineSlotStyle({
  slot: "crud-list-group-count",
  base: "hidden",
  variants: {},
  defaultVariants: {},
});

/** What sits at the start of the pager: the page-size picker and the range on show. */
export const crudListPaginationLeadStyle = defineSlotStyle({
  slot: "crud-list-pagination-lead",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The rows on show out of all of them, 「1-10 / 10」. The classic design leaves it out. */
export const crudListPaginationRangeStyle = defineSlotStyle({
  slot: "crud-list-pagination-range",
  base: "hidden",
  variants: {},
  defaultVariants: {},
});

/** The search field when it draws a leading icon and a shortcut hint around its input. */
export const crudListSearchInputStyle = defineSlotStyle({
  slot: "crud-list-search-input",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The magnifier at the start of the search field. The classic design leaves it out. */
export const crudListSearchIconStyle = defineSlotStyle({
  slot: "crud-list-search-icon",
  base: "hidden",
  variants: {},
  defaultVariants: {},
});

/** The key that moves the focus into the search field, drawn at its end. The classic design leaves it out. */
export const crudListSearchKeyStyle = defineSlotStyle({
  slot: "crud-list-search-key",
  base: "hidden",
  variants: {},
  defaultVariants: {},
});

/** The sort mark of a column not sorted yet, as one chevron. A design may draw the pair instead. */
export const crudListSortSingleStyle = defineSlotStyle({
  slot: "crud-list-sort-single",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The sort mark of a column not sorted yet, as a pair of chevrons. The classic design leaves it out. */
export const crudListSortPairStyle = defineSlotStyle({
  slot: "crud-list-sort-pair",
  base: "hidden",
  variants: {},
  defaultVariants: {},
});

/**
 * The list as a whole. Inside a record's detail it is part of the record: a design draws its head,
 * rows and pager lighter than a list standing on the page.
 */
export const crudListStyle = defineSlotStyle({
  slot: "crud-list",
  as: "part",
  base: "",
  variants: { placement: { page: "", detail: "" } },
  defaultVariants: { placement: "page" },
});
