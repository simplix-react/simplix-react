import { defineSlotStyle } from "../../design/slot-style";

/** A titled block of a modal sidebar. */
export const crudModalSidebarBlockStyle = defineSlotStyle({
  slot: "crud-modal-sidebar-block",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The block's title, set on the shared `Text` as a part. */
export const crudModalSidebarTitleStyle = defineSlotStyle({
  slot: "crud-modal-sidebar-title",
  as: "part",
  base: "mb-2.5 font-bold uppercase tracking-[0.08em]",
  variants: {},
  defaultVariants: {},
});

/**
 * One label and value row of a modal sidebar.
 *
 * <p>The on/off badge is the shared `Badge`, whose own slot is fixed, so its spacing is written as
 * a rule against it.
 */
export const crudModalSidebarRowStyle = defineSlotStyle({
  slot: "crud-modal-sidebar-row",
  base: "gap-2 border-b border-dashed py-2 first:pt-0 last:border-0 last:pb-0 [&>[data-slot=badge]]:gap-1 [&>[data-slot=badge]]:px-1.5",
  variants: {},
  defaultVariants: {},
});
