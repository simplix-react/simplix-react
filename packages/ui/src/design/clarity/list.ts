/** Clarity overrides for lists and their parts: buttons, badges, tables, chips, the filter bar, the pager, the bulk bar. */

/**
 * The ground every quiet button stands on: clarity draws no button as bare text, so a ghost, an
 * icon-only control and a pager button all take the neutral surface, darkened on hover.
 */
export const NEUTRAL_FILL = "bg-[var(--surface-2)] hover:bg-[color-mix(in_oklch,var(--surface-2),var(--foreground)_7%)]";
/** The destructive verb that is not the committing one: a soft red ground with red text. */
export const DANGER_TINT = "bg-[var(--danger-soft)] text-[var(--destructive-text)] shadow-none hover:bg-[color-mix(in_oklch,var(--danger-soft),var(--destructive)_14%)]";
export const listSlots: Record<string, string> = {
    // Buttons: squarer than badges, --h-btn at rest, the primary one lifted by a hairline highlight.
    button:
      "font-(--fw-strong) enabled:active:scale-(--press-scale) disabled:!opacity-100 disabled:!border-transparent disabled:!bg-[var(--control-disabled)] disabled:!text-[var(--ink-disabled)] disabled:!shadow-none",
    "button variant=default": "shadow-[var(--shadow-btn)] hover:bg-[var(--primary-hover)]",
    "button variant=primary": "min-w-0 shadow-[var(--shadow-btn)] hover:bg-[var(--primary-hover)]",
    "button variant=destructive": "bg-[var(--destructive)] text-white hover:bg-[color-mix(in_oklch,var(--destructive),black_8%)]",
    "button variant=outline": "border-[var(--border-strong)] bg-card shadow-[var(--shadow-1)] hover:bg-[var(--surface-2)] hover:text-foreground",
    "button variant=ghost": `text-secondary-foreground hover:text-foreground ${NEUTRAL_FILL}`,
    // A link sits on the primary soft ground, where the primary itself falls under 4.5:1, so its
    // label takes the primary's text shade.
    "button variant=link": "bg-[var(--primary-soft)] text-[var(--primary-text)] no-underline hover:bg-[color-mix(in_oklch,var(--primary-soft),var(--primary)_10%)] hover:no-underline",
    "button size=link": "h-auto rounded-[var(--radius-control)] px-1.5 py-0.5 text-xs",
    "button size=default": "h-(--h-btn) px-3",
    "button size=sm": "h-(--h-btn-sm) px-2.5 text-(length:--fs-control) leading-(--lh-control)",
    "button size=xs": "h-(--h-row) px-2 text-(length:--fs-badge) leading-(--lh-badge) rounded-[var(--radius-xs)]",
    "button size=lg": "h-9 px-5",
    "button size=icon": "size-(--h-icon-btn)",
    "button size=icon-sm": "size-[26px]",
    "button size=icon-xs": "size-(--h-row)",
    // Badges are fully round and quiet: a grey ground, no border.
    badge: "font-(--fw-strong)",
    "badge rounded=xl": "rounded-full",
    "badge rounded=lg": "rounded-full",
    "badge rounded=md": "rounded-full",
    "badge size=default": "h-[22px] px-2 py-0 text-(length:--fs-badge) leading-(--lh-badge)",
    "badge variant=secondary": "bg-[var(--surface-3)] text-secondary-foreground",
    "badge variant=outline": "border-transparent bg-[var(--surface-3)] text-secondary-foreground",
    // A status reads as a soft ground in its tone; any tone but neutral leads with a dot.
    "status-badge": "!min-w-0 h-[22px] gap-[5px] px-[9px] py-0 text-(length:--fs-badge) leading-(--lh-badge) font-(--fw-strong) !border-transparent",
    "status-badge size=sm": "px-[9px] py-0 text-(length:--fs-badge) leading-(--lh-badge)",
    "status-badge tone=neutral": "!bg-[var(--surface-3)] !text-secondary-foreground",
    "status-badge tone=success": "!bg-[var(--success-soft)] !text-[var(--success-text)] before:size-1.5 before:rounded-full before:bg-current before:content-['']",
    "status-badge tone=warning": "!bg-[var(--warn-soft)] !text-[var(--warning-text)] before:size-1.5 before:rounded-full before:bg-current before:content-['']",
    "status-badge tone=pending": "!bg-[var(--warn-soft)] !text-[var(--warning-text)] before:size-1.5 before:rounded-full before:bg-current before:content-['']",
    "status-badge tone=danger": "!bg-[var(--danger-soft)] !text-[var(--destructive-text)] before:size-1.5 before:rounded-full before:bg-current before:content-['']",
    "status-badge tone=info": "!bg-[var(--info-soft)] !text-[var(--info-text)] before:size-1.5 before:rounded-full before:bg-current before:content-['']",
    "status-badge tone=processing": "!bg-[var(--info-soft)] !text-[var(--info-text)] before:size-1.5 before:rounded-full before:bg-current before:content-['']",
    // Surfaces: hairline border, no shadow at rest.
    card: "border-[var(--border)] shadow-none",
    // Tables: a 36px tinted head, 46px rows on hairlines, a quiet hover.
    "table-header": "bg-[var(--table-head)] [&_tr]:border-[var(--border)]",
    "table-head": "!h-9 px-3 text-(length:--fs-badge) leading-(--lh-badge) font-(--fw-strong) tracking-normal text-muted-foreground [&:has(>input[type=checkbox])]:w-10 [&:has(>input[type=checkbox])]:pl-3.5 [&:has(>input[type=checkbox])]:pr-0",
    "table-head sticky=scroll": "bg-[var(--table-head)] border-[var(--border)]",
    "table-head sticky=floating": "bg-[var(--table-head)] border-[var(--border)]",
    "table-row": "border-[var(--border)] duration-[var(--dur-fast)]",
    "table-row variant=default": "hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)]",
    "table-cell": "text-(length:--fs-cell) leading-(--lh-cell) [&:has(>input[type=checkbox])]:pl-3.5 [&:has(>input[type=checkbox])]:pr-0",
    "table-cell density=compact": "h-[46px] py-0",
    "crud-list-sort-button": "-ml-1.5 h-6 gap-1 rounded-[var(--radius-control)] px-1.5 font-(--fw-strong) transition-colors duration-[var(--dur-fast)] hover:bg-[var(--hover-bg-strong)] hover:text-foreground active:scale-[0.98]",
    "crud-list-sort-icon": "ml-0 size-3 transition-colors duration-[var(--dur-fast)]",
    // An unsorted column's arrow is drawn in a token ink, never faded: a fade multiplies the ink by an
    // opacity, which leaves it under the 3:1 an icon needs on the table head. It takes the ink of the
    // header text until the button is pointed at, then the strong ink. The opacity overrides name 100
    // so the base's fade does not survive the merge.
    "crud-list-sort-icon sorted=false": "opacity-100 text-muted-foreground [button:hover>&]:opacity-100 [button:hover>&]:text-foreground",
    "crud-list-sort-single": "hidden",
    "crud-list-sort-pair": "inline",
    // The row marks: hovered, selected, the open record (an accent rule at its start), the keyboard's row.
    "crud-list-row selected=true": "bg-[var(--primary-soft)] hover:bg-[var(--primary-soft)]",
    "crud-list-row active=true": "bg-[var(--primary-soft)] shadow-[var(--shadow-row-mark)] hover:bg-[var(--primary-soft)]",
    "crud-list-row focused=true": "shadow-[inset_0_0_0_1.5px_var(--ring)]",
    "crud-list-group-row": "hover:bg-transparent",
    "crud-list-card-group": "text-(length:--fs-caption) leading-(--lh-caption) font-(--fw-semibold) text-secondary-foreground",
    "crud-list-group-cell": "!h-[30px] bg-[var(--surface-2)] py-0 text-(length:--fs-badge) leading-(--lh-badge) font-semibold text-muted-foreground",
    "crud-list-group-count": "ml-1.5 inline font-medium tabular-nums after:content-[attr(data-count)]",
    "crud-select-checkbox": "size-4 cursor-pointer appearance-none rounded-[var(--radius-xs)] border-[1.5px] border-[var(--border-strong)] bg-card bg-center bg-no-repeat align-middle hover:border-[var(--muted-2)] transition-[background-color,border-color,scale] duration-[var(--dur-fast)] active:scale-[0.98] checked:border-primary checked:bg-primary checked:bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='white'%20stroke-width='2.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M4.2%208.3l2.5%202.5L11.8%205.6'/%3E%3C/svg%3E\")] indeterminate:border-primary indeterminate:bg-primary indeterminate:bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='white'%20stroke-width='2.2'%20stroke-linecap='round'%3E%3Cpath%20d='M4.5%208h7'/%3E%3C/svg%3E\")]",
    // Row actions: plain icon buttons that show on the row being pointed at, focused or open. On a card
    // there is no row to point at and a touch screen has no pointer, so the strip is always drawn.
    "row-actions-strip": "border-0 gap-0.5 opacity-0 translate-x-1 transition-[opacity,translate] duration-[var(--dur-base)] ease-[var(--ease)] [[data-slot=crud-card]_&]:opacity-100 [[data-slot=crud-card]_&]:translate-x-0 [tr:hover_&]:ease-[var(--ease-spring)] [tr:focus-within_&]:ease-[var(--ease-spring)] [tr:hover_&]:opacity-100 [tr:hover_&]:translate-x-0 [tr:focus-within_&]:opacity-100 [tr:focus-within_&]:translate-x-0 [tr[data-part-active=true]_&]:opacity-100 [tr[data-part-active=true]_&]:translate-x-0 [tr[data-part-focused=true]_&]:opacity-100 [tr[data-part-focused=true]_&]:translate-x-0",
    "row-actions-strip-button": `size-[26px] rounded-[var(--radius-control)] border-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground active:scale-[0.98] ${NEUTRAL_FILL}`,
    "row-actions-strip-button ruled=true": "border-l-0",
    // A list too narrow for its table draws each row as a card (the proposal's rcard), inset in the list card.
    "crud-list-view": "[&:not(:has(table))]:p-2.5",
    "crud-card": "rounded-[var(--radius-surface)] border-[var(--border)] bg-card hover:bg-card hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-2)] hover:-translate-y-px transition-[border-color,box-shadow,translate] duration-[var(--dur-fast)] ease-[var(--ease)]",
    "crud-list-card-header": "border-b-0 px-3 pt-3 pb-1",
    "crud-card-body": "px-3 pb-3 text-(length:--fs-control) leading-(--lh-control)",
    "crud-list-select-all-row": "px-1 pb-1",
    "crud-list-select-all": "text-(length:--fs-control) leading-(--lh-control)",
    // The toolbar inside the list card: the count as words, round chips, the search, the filter button.
    "crud-filter-bar": "gap-2 border-b border-[var(--border)] px-3 py-2.5",
    "crud-filter-bar-leading": "gap-2",
    "crud-filter-bar-trailing": "gap-2",
    "list-total-badge": "h-auto gap-0 border-0 bg-transparent px-0 py-0 text-(length:--fs-control) leading-(--lh-control) font-normal text-muted-foreground",
    "list-total-badge-icon": "hidden",
    "list-total-badge-figure": "mx-1.5 font-semibold text-foreground tabular-nums",
    "crud-chip-filter-chip": "h-7 gap-1.5 px-[11px] py-0 text-(length:--fs-control) leading-(--lh-control) font-medium transition-[background-color,border-color,color,scale] duration-[var(--dur-fast)] active:scale-[0.98]",
    "crud-chip-filter-chip state=idle": "border-[var(--border-strong)] bg-card text-secondary-foreground hover:border-[var(--muted-2)] hover:bg-card hover:text-foreground",
    "crud-chip-filter-chip state=active": "border-foreground bg-foreground text-background hover:bg-foreground hover:text-background [&>svg]:!hidden",
    "crud-chip-filter-idle-mark": "!hidden",
    "crud-list-search-input": "h-8 pl-[34px] pr-8",
    "crud-list-search-icon": "block size-4 text-muted-foreground",
    "crud-list-search-key": "inline-grid h-[18px] min-w-[18px] place-items-center rounded-[var(--radius-xs)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-1 font-sans text-(length:--fs-label) leading-none text-muted-foreground",
    "crud-filter-bar-segment": "!h-8 gap-0 overflow-clip rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-card p-0 shadow-[var(--shadow-1)] [&>*+*]:border-l [&>*+*]:border-[var(--border-strong)]",
    "crud-filter-bar-trigger": "!h-full w-8 justify-center gap-1 rounded-none border-0 bg-card px-0 text-(length:--fs-control) leading-(--lh-control) font-(--fw-strong) text-foreground hover:bg-[var(--surface-2)] has-[[data-slot=badge]]:w-auto has-[[data-slot=badge]]:px-2",
    "crud-filter-bar-trigger-label": "sr-only",
    "crud-filter-bar-trigger active=false": "text-foreground hover:text-foreground",
    "crud-filter-bar-divider": "!hidden",
    "crud-filter-bar-clear-button": "w-8 rounded-none bg-card text-foreground hover:bg-[var(--surface-2)]",
    "crud-filter-bar-columns-button": "w-8 rounded-none bg-card text-foreground hover:bg-[var(--surface-2)]",
    // The pager: the page size and the range at the start, the page numbers at the end.
    "crud-list-pagination": "gap-4 border-[var(--border)] px-3 py-2 text-(length:--fs-control) leading-(--lh-control) text-muted-foreground",
    "crud-list-pagination framed=false": "bg-card",
    "crud-list-pagination-lead": "mr-auto gap-2",
    "crud-list-pagination-label": "text-(length:--fs-control) leading-(--lh-control) text-muted-foreground",
    "crud-list-pagination-range": "inline tabular-nums",
    "crud-list-page-size": "h-[26px] border-[var(--border-strong)] bg-card text-(length:--fs-control) leading-(--lh-control) font-normal tabular-nums",
    "crud-list-page-button": `h-[26px] min-w-[26px] rounded-[var(--radius-control)] border-0 text-(length:--fs-control) leading-(--lh-control) font-(--fw-strong) text-secondary-foreground transition-[background-color,color,scale] duration-[var(--dur-fast)] hover:text-foreground active:scale-[0.98] ${NEUTRAL_FILL}`,
    "crud-list-page-button current=true": "bg-foreground text-card hover:bg-foreground hover:text-card",
    // The bar that rises while rows are selected: the dark strong overlay.
    "bulk-action-bar": "gap-0 [&>span:nth-child(2)]:font-semibold [&>[data-slot=button]]:ml-1 rounded-[var(--radius-overlay)] border-0 bg-[var(--popover-strong)] py-1.5 pl-3.5 pr-1.5 text-(length:--fs-cell) leading-(--lh-cell) text-[var(--popover-strong-foreground)] shadow-[var(--shadow-3)] [&_[data-slot=button]]:text-inherit [&_[data-slot=button]]:opacity-85 [&_[data-slot=button]:hover]:bg-[oklch(1_0_0/0.12)] [&_[data-slot=button]:hover]:opacity-100",
    "bulk-action-bar-count": "font-semibold tabular-nums",
    "bulk-action-bar-actions": "ml-2.5 gap-1",
};
