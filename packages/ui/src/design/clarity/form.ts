/** Clarity overrides for forms and dialogs: fields, inputs, selects, toggles, validation, dialog chrome. */

// One control look shared by every text-like control: the strong hairline, a darker hairline on
// hover, the accent border with a soft halo on focus, a red halo when invalid, a grey ground when
// it cannot be edited. Border and halo ease on the fast duration.
const control =
  "bg-card border-[var(--border-strong)] rounded-[var(--radius-control)] transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] enabled:hover:border-[var(--muted-2)]";
const controlFocus = "focus-visible:border-[var(--ring)]! focus-visible:shadow-[var(--focus-halo)]";
const controlInvalid =
  "aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:shadow-[var(--invalid-halo)] aria-[invalid=true]:focus-visible:border-[var(--destructive)]!";
const controlLocked =
  "disabled:opacity-100 disabled:bg-[var(--surface-2)] disabled:text-muted-foreground read-only:bg-[var(--surface-2)] read-only:focus-visible:shadow-none";

// The overlay surface shared by popovers, menus and the select panel.
const overlay = "rounded-[var(--radius-overlay)] border-[var(--border)] bg-popover shadow-[var(--shadow-3)]";
// One row of a menu or a select panel: 32px, control radius, a grey ground under the pointer.
const menuRow =
  "min-h-8 rounded-[var(--radius-control)] transition-colors duration-[var(--dur-fast)] focus:bg-[var(--surface-2)] focus:text-foreground";

export const formSlots: Record<string, string> = {
  // ── Labelled fields: 12.5/550 labels six pixels above a 36px control ──
  label: "text-(length:--fs-control) font-(--fw-strong) leading-4 text-foreground",
  "field-wrapper layout=top": "gap-1.5",
  "field-wrapper layout=trailing": "gap-1.5",
  "field-wrapper size=sm":
    "[&_label]:text-(length:--fs-control) leading-(--lh-control) [&_input]:h-9 [&_input]:text-(length:--fs-cell) leading-(--lh-cell) [&_[data-slot=select-trigger]]:h-9 [&_[data-slot=date-picker-trigger]]:h-9 [&_[data-slot=field-multiselect-box]]:min-h-9",
  "field-required": "ml-0.5 font-normal text-[var(--destructive-text)]",
  "field-message": "text-(length:--fs-badge) leading-4",
  "field-message variant=error": "text-[var(--destructive-text)]",
  "field-message variant=warning": "text-[var(--warning-text)]",
  "field-message variant=info": "text-[var(--info-text)]",
  "field-message variant=description": "text-muted-foreground",

  // ── Text-like controls ──
  input: `${control} ${controlFocus} ${controlInvalid} ${controlLocked} px-[11px]`,
  textarea: `${control} ${controlFocus} ${controlInvalid} ${controlLocked} px-[11px] py-[9px]`,
  "select-trigger": `${control} focus:border-[var(--ring)]! focus:shadow-[var(--focus-halo)] data-[state=open]:border-[var(--ring)] data-[state=open]:shadow-[var(--focus-halo)] aria-[invalid=true]:border-[var(--destructive)] disabled:opacity-100 disabled:bg-[var(--surface-2)] disabled:text-muted-foreground [&[data-state=open]_[data-slot=field-chevron]]:rotate-180`,
  "field-chevron": "opacity-60 transition-transform duration-[var(--dur-base)] ease-[var(--ease)]",
  "field-multiselect-box": `${control} focus-within:border-[var(--ring)]! focus-within:shadow-[var(--focus-halo)]`,
  "date-picker-trigger": `${control} focus-visible:ring-0 focus-visible:border-[var(--ring)]! focus-visible:shadow-[var(--focus-halo)] data-[state=open]:border-[var(--ring)]! data-[state=open]:shadow-[var(--focus-halo)] [&>svg:first-child]:opacity-60`,
  "number-input": `${control} hover:border-[var(--muted-2)] focus-within:border-[var(--ring)]! focus-within:shadow-[var(--focus-halo)] has-[[aria-invalid=true]]:shadow-[var(--invalid-halo)]`,
  "number-input disabled=true": "opacity-100 bg-[var(--surface-2)] text-muted-foreground hover:border-[var(--border-strong)]",
  "number-input-spinner": "border-[var(--border)]",
  "number-input-step": "text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-2)] hover:text-foreground active:bg-[var(--surface-3)]",
  "number-input-step direction=decrease": "border-[var(--border)]",

  // ── Choices: a 1.5px box that fills with the accent; the switch thumb springs across ──
  checkbox:
    "rounded-[var(--radius-xs)] border-[1.5px] border-[var(--border-strong)] bg-card transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)] enabled:hover:border-[var(--muted-2)] focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] focus-visible:border-[var(--ring)] data-[state=checked]:border-[var(--primary)] data-[state=indeterminate]:border-[var(--primary)]",
  "radio-group-item":
    "border-[1.5px] border-[var(--border-strong)] bg-card transition-[border-color,box-shadow] duration-[var(--dur-fast)] enabled:hover:border-[var(--muted-2)] focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] data-[state=checked]:border-[var(--primary)]",
  switch:
    "duration-[var(--dur-base)] focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] data-[state=unchecked]:bg-[var(--border-strong)] enabled:hover:data-[state=unchecked]:bg-[var(--muted-2)] enabled:hover:data-[state=checked]:bg-[var(--primary-hover)]",
  "switch-thumb": "shadow-[var(--shadow-1)] duration-[var(--dur-base)] ease-[var(--ease-spring)]",

  // ── Option panels and menus ──
  "select-content": overlay,
  "select-viewport": "p-[5px]",
  "select-item": `${menuRow} text-(length:--fs-cell) leading-(--lh-cell) data-[state=checked]:font-(--fw-strong) data-[state=checked]:text-[var(--primary-text)]`,
  "select-label": "text-(length:--fs-badge) leading-(--lh-badge) font-semibold text-muted-foreground",
  "select-separator": "bg-[var(--border)]",
  "popover-content": overlay,
  "dropdown-menu-content": `${overlay} p-[5px]`,
  "dropdown-menu-sub-content": `${overlay} p-[5px]`,
  "dropdown-menu-item": `${menuRow} text-(length:--fs-cell) leading-(--lh-cell)`,
  "dropdown-menu-checkbox-item": `${menuRow} text-(length:--fs-cell) leading-(--lh-cell)`,
  "dropdown-menu-radio-item": `${menuRow} text-(length:--fs-cell) leading-(--lh-cell)`,
  "dropdown-menu-sub-trigger": `${menuRow} text-(length:--fs-cell) leading-(--lh-cell) data-[state=open]:bg-[var(--surface-2)]`,
  "dropdown-menu-label": "text-(length:--fs-badge) leading-(--lh-badge) font-semibold text-muted-foreground",
  "dropdown-menu-separator": "bg-[var(--border)] mx-1 my-[5px]",
  "tooltip-content": "rounded-[var(--radius-control)] bg-[var(--popover-strong)] px-2 py-[5px] text-(length:--fs-badge) leading-(--lh-badge) text-[var(--popover-strong-foreground)] shadow-[var(--shadow-2)]",
  "tooltip-arrow": "bg-[var(--popover-strong)] fill-[var(--popover-strong)]",

  // ── The form in a panel or a page: a 15/600 head, a 16px inset, the footer ruled off ──
  "crud-form-header": "border-[var(--border)] pt-3.5 pb-3 transition-shadow duration-[var(--dur-base)] ease-[var(--ease)] [&_[data-slot=heading]]:text-(length:--fs-title-sm) [&_[data-slot=heading]]:font-semibold [&_[data-slot=heading]]:leading-6 [&_[data-slot=heading]]:text-foreground [&_[data-slot=button][data-size=icon-xs]]:size-8 [&_[data-slot=button][data-size=icon-xs]_svg]:!size-4",
  "crud-form-header page=false": "px-4",
  // Fields scrolled under the head and more fields waiting below the footer each cast a soft edge.
  "crud-form-header scrolled=true": "relative z-[1] shadow-[0_8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  "crud-form-body page=false":
    "px-4 [&_[data-part=crud-form-content]>[data-slot=section-shell]]:border-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]]:bg-transparent [&_[data-part=crud-form-content]>[data-slot=section-shell]]:shadow-none [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-body]]:px-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-header]]:border-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-header]]:bg-transparent [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-header]]:px-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]_[data-slot=section-shell-title]]:text-(length:--fs-cell) leading-(--lh-cell) [&_[data-part=crud-form-content]>[data-slot=section-shell]_[data-slot=section-shell-title]]:font-(--fw-heavy) [&_[data-part=crud-form-content]>[data-slot=section-shell]_[data-slot=section-shell-title]]:tracking-[-0.01em]",
  "crud-form-content": "py-3 gap-4",
  "crud-form-footer": "transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  "crud-form-footer page=false": "px-4",
  "crud-form-footer overflow=true": "relative z-[1] shadow-[0_-8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  // Footer and dialog action buttons are one height, 32px, in every footer.
  "crud-form-actions": "gap-1.5 border-[var(--border)] py-3 [&_[data-slot=button][data-size=sm]]:h-8 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-(length:--fs-body-sm) leading-(--lh-body-sm)",

  // ── Dialogs, alert panels and sheets: the bands, spacing and motion are the shared declarations;
  // clarity draws them as a card on the tinted scrim with a 17/650 title, hairlines in --border
  // and the footer on the --surface-2 step. ──
  "dialog-overlay": "bg-[var(--scrim)] backdrop-blur-[2px]",
  "dialog-content": "rounded-[var(--radius-overlay)] border-[var(--border)] bg-card shadow-[var(--shadow-3)]",
  "dialog-header": "border-[var(--border)]",
  "dialog-header scrolled=true": "shadow-[0_8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  "dialog-title": "text-(length:--fs-title) leading-(--lh-title) font-(--fw-heavy) tracking-[-0.02em]",
  "dialog-description": "text-(length:--fs-cell) leading-5 text-secondary-foreground",
  "dialog-footer": "border-[var(--border)] bg-[var(--surface-2)] [&_[data-slot=button][data-size=sm]]:h-8 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-(length:--fs-body-sm) leading-(--lh-body-sm)",
  "dialog-footer overflow=true": "shadow-[0_-8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  "dialog-corner-button": "rounded-[var(--radius-control)] bg-[var(--surface-2)] text-muted-foreground opacity-100 hover:bg-[color-mix(in_oklch,var(--surface-2),var(--foreground)_7%)] hover:text-foreground",

  "alert-panel-overlay": "bg-[var(--scrim)] backdrop-blur-[2px]",
  "alert-panel-content": "rounded-[var(--radius-overlay)] border-[var(--border)] bg-card shadow-[var(--shadow-3)]",
  "alert-panel-title": "text-(length:--fs-title) leading-(--lh-title) font-(--fw-heavy) tracking-[-0.02em] border-[var(--border)]",
  "alert-panel-title scrolled=true": "shadow-[0_8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  "alert-panel-description": "text-(length:--fs-cell) leading-[1.6] text-secondary-foreground whitespace-pre-line",
  "alert-panel-footer": "border-[var(--border)] bg-[var(--surface-2)] [&_[data-slot=button][data-size=sm]]:h-8 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-(length:--fs-body-sm) leading-(--lh-body-sm)",
  "alert-panel-footer overflow=true": "shadow-[0_-8px_12px_-12px_oklch(0.2_0.03_265/0.45)]",
  "alert-panel-cancel": "rounded-[var(--radius-control)] text-(length:--fs-body-sm) leading-(--lh-body-sm) transition-[background-color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease)] focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] border-[var(--border-strong)] bg-card shadow-[var(--shadow-1)] hover:bg-[var(--surface-2)] hover:text-foreground",
  "alert-panel-action": "rounded-[var(--radius-control)] text-(length:--fs-body-sm) leading-(--lh-body-sm) transition-[background-color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease)] focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] shadow-[var(--shadow-btn)] hover:bg-[var(--primary-hover)]",
  "alert-panel-action tone=danger": "bg-[var(--destructive)] text-white hover:bg-[color-mix(in_oklch,var(--destructive),black_8%)]",

  "sheet-overlay": "bg-[var(--scrim)] backdrop-blur-[2px]",
  "sheet-content": "bg-card border-[var(--border)] shadow-[var(--shadow-3)]",
  "sheet-close": "rounded-[var(--radius-control)] bg-[var(--surface-2)] text-muted-foreground opacity-100 hover:bg-[color-mix(in_oklch,var(--surface-2),var(--foreground)_7%)] hover:text-foreground focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] data-[state=open]:bg-transparent",
  "sheet-header": "border-[var(--border)]",
  "sheet-title": "text-(length:--fs-title) leading-(--lh-title) font-(--fw-heavy) tracking-[-0.02em]",
  "sheet-description": "text-(length:--fs-cell) leading-(--lh-cell) text-secondary-foreground",
  "sheet-footer": "border-[var(--border)] bg-[var(--surface-2)] [&_[data-slot=button][data-size=sm]]:h-8 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-(length:--fs-body-sm) leading-(--lh-body-sm)",

  // ── Toasts: the dark strong overlay, a tinted glyph, a spring in and a slide out ──
  toast: "rounded-[var(--radius-overlay)] border-0 bg-[var(--popover-strong)] py-2.5 ps-3.5 pe-2 text-[var(--popover-strong-foreground)] shadow-[var(--shadow-3)] backdrop-blur-none duration-[var(--dur-base)] ease-[var(--ease-spring)]",
  "toast type=success": "border-0 bg-[var(--popover-strong)]",
  "toast type=warning": "border-0 bg-[var(--popover-strong)]",
  "toast type=error": "border-0 bg-[var(--popover-strong)]",
  "toast type=info": "border-0 bg-[var(--popover-strong)]",
  "toast phase=entering": "translate-x-0 translate-y-1 opacity-0",
  "toast phase=exiting": "translate-x-0 translate-y-1 opacity-0 ease-[var(--ease)]",
  "toast-icon type=success": "text-[var(--toast-success)]",
  "toast-icon type=warning": "text-[var(--toast-warn)]",
  "toast-icon type=error": "text-[var(--toast-danger)]",
  "toast-icon type=info": "text-[var(--toast-info)]",
  "toast-message": "text-(length:--fs-body-sm) leading-(--lh-body-sm) font-medium",
  "toast-action": "rounded-[var(--radius-sm)] bg-white/12 px-2 py-1 text-[var(--popover-strong-foreground)] no-underline hover:bg-white/20 hover:no-underline",
  "toast-dismiss": "opacity-60 hover:opacity-100",
  // A window preset that is not the current one still stands on a ground, as every action button
  // does in clarity; the current one is filled with the accent.
  "time-range-preset active=false": "bg-[var(--surface-2)]",
  "time-range-nav-button": "bg-[var(--surface-2)]",
};
