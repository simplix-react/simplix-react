/** Clarity overrides for the base parts: buttons, badges, surfaces, tables, tabs, chips, inputs, overlays. */
export const baseSlots: Record<string, string> = {
    // Buttons: squarer than badges, the primary one lifted by a hairline highlight.
    button: "font-medium active:translate-y-px",
    "button variant=default": "shadow-[var(--shadow-btn)] hover:bg-[var(--primary-hover)]",
    "button variant=primary": "shadow-[var(--shadow-btn)] hover:bg-[var(--primary-hover)]",
    "button variant=outline": "border-[var(--border-strong)] bg-card shadow-[var(--shadow-1)] hover:bg-[var(--surface-2)]",
    "button variant=ghost": "text-secondary-foreground hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
    "button size=default": "h-8 px-3.5",
    "button size=lg": "h-9 px-5",
    // Badges are fully round and quiet.
    badge: "font-medium",
    "badge rounded=xl": "rounded-full",
    "badge rounded=lg": "rounded-full",
    "badge rounded=md": "rounded-full",
    "badge size=default": "px-2.5 py-0.5",
    "badge variant=secondary": "bg-[var(--surface-3)] text-secondary-foreground",
    // Surfaces: hairline border, no shadow at rest.
    card: "border-[var(--border)] shadow-none",
    "card interactive=true": "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-2)]",
    "stat-card": "shadow-none hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-2)] transition-[box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease)]",
    "stat-card-title": "font-medium text-secondary-foreground",
    "stat-card-value": "font-semibold tracking-[-0.03em] tabular-nums text-[1.75rem]",
    "section-shell variant=card": "shadow-none",
    "section-shell-header variant=card": "bg-[var(--table-head)]",
    "crud-list-toolbar": "border-[var(--border)] bg-card",
    // Tables: a tinted head, hairline rows, a quiet hover.
    "table-header": "bg-[var(--table-head)] [&_tr]:border-[var(--border)]",
    "table-head": "text-[0.75rem] font-semibold tracking-normal text-muted-foreground",
    "table-row": "border-[var(--border)]",
    "table-row variant=default": "hover:bg-[var(--hover-bg)]",
    // Tabs: an underline in the foreground, counts in pills.
    "tabs-list variant=default": "border-[var(--border)] bg-[var(--surface-3)] p-0.5",
    "tabs-trigger variant=default": "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-1)] data-[state=active]:hover:text-foreground",
    "tabs-trigger variant=underline": "data-[state=active]:border-foreground",
    // Chips: round, outlined at rest, solid foreground when on.
    "crud-chip-filter-chip state=idle": "border-[var(--border-strong)] bg-card text-secondary-foreground hover:border-[var(--muted-2)] hover:bg-card hover:text-foreground",
    "crud-chip-filter-chip state=active": "border-foreground bg-foreground text-background",
    // Inputs on the card ground with an accent focus border.
    input: "bg-card",
    textarea: "bg-card",
    "select-trigger": "bg-card",
    // Overlays: a step rounder, one shadow.
    "dialog-content": "border-[var(--border)]",
    "popover-content": "border-[var(--border)]",
    "dropdown-menu-content": "border-[var(--border)]",
    "dialog-overlay": "bg-[var(--scrim)] backdrop-blur-[2px]",
};
