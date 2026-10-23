import { defineSlotStyle } from "../../design/slot-style";

/**
 * Panel variant: horizontal padding keeps a visible gap between fields and the body scrollbar;
 * header, body and footer share it so their edges stay aligned. Page variant: the document owns
 * the scroll, so the body neither scrolls nor insets.
 */
const panelGutter = { true: "", false: "px-3" };

/** The strip above a form that holds its header and the close button. */
export const crudFormHeaderStyle = defineSlotStyle({
  slot: "crud-form-header",
  as: "part",
  base: "border-b pb-2",
  variants: { page: { true: "", false: "px-3" } },
  defaultVariants: { page: false },
});

/** The body of a form. */
export const crudFormBodyStyle = defineSlotStyle({
  slot: "crud-form-body",
  base: "",
  variants: { page: panelGutter },
  defaultVariants: { page: false },
});

/** The stack of sections inside the body. */
export const crudFormContentStyle = defineSlotStyle({
  slot: "crud-form-content",
  as: "part",
  base: "py-2",
  variants: {},
  defaultVariants: {},
});

/** The footer area below the body. */
export const crudFormFooterStyle = defineSlotStyle({
  slot: "crud-form-footer",
  base: "",
  variants: { page: panelGutter },
  defaultVariants: { page: false },
});

/** A row of actions under a form. */
export const crudFormActionsStyle = defineSlotStyle({
  slot: "crud-form-actions",
  as: "part",
  base: "border-t pt-2",
  // `spread` pushes the first action to the far start, the rest to the end.
  variants: { spread: { true: "[&>*:first-child]:mr-auto", false: "" } },
  defaultVariants: { spread: false },
});
