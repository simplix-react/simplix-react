/** Clarity overrides for the page body: headings, figure cards, tabs, sections, notices. */
export const pageSlots: Record<string, string> = {
    "card interactive=true": "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-2)]",
    // The page title: 24px at 650, set tight.
    "heading level=1": "text-2xl leading-[1.2] font-[650] tracking-[-0.028em]",
    // A figure tile: a white card on a hairline, lifted by a deeper shadow under the pointer. The
    // label, the figure and the foot stand in one column with the foot pushed to the bottom.
    "stat-card":
        "flex min-h-[124px] flex-col gap-1 border-[var(--border)] px-4 py-3.5 shadow-[var(--shadow-1)] transition-[box-shadow,border-color,transform] duration-[var(--dur-base)] ease-[var(--ease)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-2)]",
    // The status is the figure's colour, never a tinted card: the tone surface is a class the card
    // is handed at runtime, so it is outweighed here rather than replaced.
    "stat-card tinted=true": "border-[var(--border)]! bg-card!",
    "stat-card-header": "min-h-[22px] gap-2",
    "stat-card-title": "text-[12.5px] font-[550] text-secondary-foreground",
    "stat-card-body": "mt-1.5",
    "stat-card-value": "text-[30px] leading-none font-semibold tracking-[-0.035em] tabular-nums",
    "stat-card-value tone=warning": "text-[var(--warning-text)]",
    "stat-card-value tone=danger": "text-[var(--destructive-text)]",
    // While the figure is read: a 54x26 bar with a shine passing across it.
    "stat-card-skeleton":
        "h-[26px] w-[54px] rounded-[var(--radius-sm)] bg-[linear-gradient(90deg,var(--surface-3),var(--shimmer),var(--surface-3))] bg-[length:200%_100%]",
    "stat-card-unit": "ms-1 font-sans text-[12.5px] font-medium tracking-normal text-muted-foreground",
    "stat-card-footer": "mt-auto pt-2 gap-x-2.5",
    "stat-card-description": "text-[11.5px] text-muted-foreground",
    "section-shell variant=card": "shadow-none",
    "section-shell-header variant=card": "bg-[var(--table-head)]",
    "crud-list-toolbar": "border-[var(--border)] bg-card",
    "tabs-list variant=default": "border-[var(--border)] bg-[var(--surface-3)] p-0.5",
    "tabs-trigger variant=default": "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-1)] data-[state=active]:hover:text-foreground",
    "tabs-trigger variant=underline": "data-[state=active]:border-foreground",
    // The page's own tab strip: tabs standing on a hairline, the chosen one marked by the ink that
    // slides under it rather than by a filled pill.
    "tabs-list variant=full":
        "mt-0 h-auto justify-start gap-0.5 rounded-none border-0 bg-transparent p-0 shadow-[inset_0_-1px_0_0_var(--border)] [&>[role=tab]]:flex-none",
    "tabs-trigger variant=full":
        "h-10 gap-[7px] rounded-none px-3 py-0 text-[13.5px] font-[550] text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:hover:text-foreground",
    "tabs-ink variant=full":
        "block h-0.5 w-[var(--w)] translate-x-[var(--x)] bg-primary transition-[translate,width] duration-[var(--dur-slow)] ease-[var(--ease)]",
    // A standing notice is a white card on a hairline; a warning takes the warm ground. The tone
    // surface is a class the banner is handed at runtime, so it is outweighed here.
    "alert-banner density=sm": "rounded-[var(--radius-surface)] py-2.5 ps-4 pe-2.5",
    "alert-banner tone=neutral": "border-[var(--border)]! bg-card!",
    "alert-banner tone=info": "border-[var(--border)]! bg-card!",
    "alert-banner tone=warning": "border-[var(--warn-border)]! bg-[var(--warn-soft)]!",
    "alert-banner-icon tone=neutral": "text-[var(--info-text)]!",
    "alert-banner-icon tone=info": "text-[var(--info-text)]!",
    "alert-banner-icon tone=warning": "text-[var(--warning-text)]!",
};
