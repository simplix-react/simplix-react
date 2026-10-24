import { defineSlotStyle } from "../../design/slot-style";

/**
 * Panel variant: the 16px inset a detail uses keeps a visible gap between fields and the body
 * scrollbar; header, body and footer share it so their edges stay aligned. Page variant: the
 * document owns the scroll, so the body neither scrolls nor insets.
 */
const panelGutter = { true: "", false: "px-4" };

/** The strip above a form that holds its header and the close button. */
export const crudFormHeaderStyle = defineSlotStyle({
  slot: "crud-form-header",
  as: "part",
  // The close control is the 32px corner button every panel shares.
  base: "border-b pt-3.5 pb-3 transition-shadow duration-[var(--dur-base)] ease-[var(--ease)] [&_[data-slot=button][data-size=icon-xs]]:size-8 [&_[data-slot=button][data-size=icon-xs]_svg]:!size-4",
  variants: {
    page: { true: "", false: "px-4" },
    /** The body is scrolled, so fields pass under this strip: a soft edge shows under it. */
    scrolled: { true: "relative z-[1] shadow-[0_8px_12px_-12px_oklch(0_0_0/0.35)]", false: "" },
  },
  defaultVariants: { page: false, scrolled: false },
});

/**
 * The body of a form. In a panel its sections are flat: no frame, the title and fields on the
 * body's inset.
 */
export const crudFormBodyStyle = defineSlotStyle({
  slot: "crud-form-body",
  base: "",
  variants: {
    page: {
      true: "",
      false:
        "px-4 [&_[data-part=crud-form-content]>[data-slot=section-shell]]:border-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]]:bg-transparent [&_[data-part=crud-form-content]>[data-slot=section-shell]]:shadow-none [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-body]]:px-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-header]]:border-0 [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-header]]:bg-transparent [&_[data-part=crud-form-content]>[data-slot=section-shell]>[data-slot=section-shell-header]]:px-0",
    },
  },
  defaultVariants: { page: false },
});

/** The stack of sections inside the body. */
export const crudFormContentStyle = defineSlotStyle({
  slot: "crud-form-content",
  as: "part",
  base: "py-3 gap-4",
  variants: {},
  defaultVariants: {},
});

/** The footer area below the body. */
export const crudFormFooterStyle = defineSlotStyle({
  slot: "crud-form-footer",
  base: "transition-shadow duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    page: panelGutter,
    /** More of the body lies below, hidden behind this strip: a soft edge rises above it. */
    overflow: { true: "relative z-[1] shadow-[0_-8px_12px_-12px_oklch(0_0_0/0.35)]", false: "" },
  },
  defaultVariants: { page: false, overflow: false },
});

/** A row of actions under a form. */
export const crudFormActionsStyle = defineSlotStyle({
  slot: "crud-form-actions",
  as: "part",
  // 12px above and below the buttons, as the detail's action row.
  base: "gap-1.5 border-t pt-3 pb-3",
  // `spread` pushes the first action to the far start, the rest to the end.
  variants: { spread: { true: "[&>*:first-child]:mr-auto", false: "" } },
  defaultVariants: { spread: false },
});
