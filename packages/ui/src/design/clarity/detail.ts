/**
 * Clarity overrides for detail pages: header, tabs, field grid, lists inside a detail, audit block, actions.
 *
 * Structure, spacing, placement and motion are the classic declarations' and the same in every
 * design (crud-detail.style.ts, crud-detail-audit-footer.style.ts, list-detail.style.ts); the keys
 * here carry clarity's colour, type, radius and surface only.
 *
 * Only slots that exist for the detail alone are keyed here unscoped. Anything shared with the list
 * or the page (tables, tabs, buttons, badges) is styled from a detail ancestor (`crud-detail-body`,
 * `crud-detail-header`, `crud-detail-actions`) so this fragment, spread after the others, never
 * restyles the same slot outside a detail.
 */
export const detailSlots: Record<string, string> = {
  // The panel beside the list: a raised card. The divider's rule and grip take the ring colour.
  "crud-list-detail-divider": "hover:bg-[var(--ring)] active:bg-[var(--ring)] focus-visible:bg-[var(--ring)]",
  "crud-list-detail-detail open=true": "rounded-[var(--radius-surface)] border-[var(--border)] shadow-[var(--shadow-2)]",
  // Drawer: the same card ground as the panel. The dialog presentation's frame (overlay, band,
  // size) belongs to the dialog design.
  "crud-list-detail-drawer": "border-[var(--border)] bg-card shadow-[var(--shadow-3)]",

  // The head's close control on the control radius; the scroll edge in the cool shadow.
  "crud-detail-header": "[&_[data-slot=button][data-size=icon-xs]]:rounded-[var(--radius-control)]",
  "crud-detail-header scrolled=true": "shadow-[0_8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",

  // Tabs: a hairline under the strip, the chosen trigger ruled in the accent at 600. Detail list
  // rows on the control radius and hairlines.
  "crud-detail-body":
    "[&_[data-slot=tabs-list][data-variant=underline]]:border-[var(--border)] [&_[data-slot=tabs-trigger][data-variant=underline]]:rounded-t-[var(--radius-control)] [&_[data-slot=tabs-trigger][data-variant=underline]]:text-[13px] [&_[data-slot=tabs-trigger][data-variant=underline][data-state=active]]:border-primary [&_[data-slot=tabs-trigger][data-variant=underline][data-state=active]]:text-foreground [&_[data-slot=tabs-trigger][data-variant=underline][data-state=active]]:font-[600] " +
    "[&_[data-slot=detail-list]]:rounded-[var(--radius-control)] [&_[data-slot=detail-list]]:border-[var(--border)] [&_[data-slot=detail-list-row]]:border-[var(--border)] [&_[data-slot=detail-list-footer]]:border-[var(--border)]",

  // Sections: a 13.5px title, the rule between sections a hairline.
  "crud-detail-content": "[&_[data-slot=section-shell-title]]:text-[13.5px] [&_[data-slot=section-shell-title]]:font-[650] [&_[data-slot=section-shell-title]]:tracking-[-0.01em] [&_[data-slot=section-shell][data-variant=flat]]:border-[var(--border)]",
  // The field grid's type (language.md, [detail] field grid): an 11.5px label, a 13.5px value.
  "crud-detail-section-body":
    "[&_[data-slot=field-detail-label]]:!text-[11.5px] [&_[data-slot=field-detail-label]]:font-[500] [&_[data-slot=field-detail-label]]:leading-4 [&_[data-slot=field-detail-label]]:text-muted-foreground [&_[data-slot=field-detail-value]]:!text-[13.5px] [&_[data-slot=field-detail-value]]:font-medium [&_[data-slot=field-detail-value]]:leading-5",

  // The audit block: a hairline, 11.5px stamps, the id as an 11px mono chip on the control radius.
  "crud-detail-audit-footer": "border-[var(--border)] text-[11.5px] text-[var(--muted-2)]",
  "crud-detail-audit-id": "rounded-[var(--radius-control)] text-[11px] leading-4 tracking-[0.02em] tabular-nums text-muted-foreground",
  "crud-detail-audit-copied": "text-[var(--success-text)]",
  "crud-detail-audit-tooltip":
    "rounded-[var(--radius-control)] border-0 bg-[var(--popover-strong)] text-[var(--popover-strong-foreground)] shadow-[var(--shadow-3)]",
  "crud-detail-audit-tooltip-id": "tracking-[0.02em]",
  "crud-detail-audit-tooltip-hint": "text-[var(--popover-strong-foreground)] opacity-70",
  "crud-detail-audit-date": "text-muted-foreground",

  // The finishing row: the destructive verb drawn as red text; the footer's scroll edge in the
  // cool shadow.
  "crud-detail-footer overflow=true": "shadow-[0_-8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  "crud-detail-actions":
    "border-[var(--border)] [&_[data-slot=button][data-variant=destructive]]:bg-transparent [&_[data-slot=button][data-variant=destructive]]:text-[var(--destructive-text)] [&_[data-slot=button][data-variant=destructive]]:shadow-none [&_[data-slot=button][data-variant=destructive]:focus-visible]:shadow-[var(--focus-halo)] [&_[data-slot=button][data-variant=destructive]:hover]:bg-[var(--danger-soft)] [&_[data-slot=button][data-size=sm]]:h-8 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-[13px]",
  "crud-detail-action-footer": "border-[var(--border)] [&_[data-slot=button][data-size=sm]]:h-8 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-[13px]",
  "crud-detail-action-footer-row": "border-[var(--border)]",
};
