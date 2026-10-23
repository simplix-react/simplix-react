import { defineSlotStyle } from "../design/slot-style";

/** The bar under an editor, holding its actions. */
export const editorFooterStyle = defineSlotStyle({
  slot: "editor-footer",
  base: "gap-4 border-t px-5 py-3",
  variants: {},
  defaultVariants: {},
});
