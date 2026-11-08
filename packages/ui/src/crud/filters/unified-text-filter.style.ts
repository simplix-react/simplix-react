import { defineSlotStyle } from "../../design/slot-style";

/** The operator button (or the plain operator icon) between the field selector and the input. */
export const crudUnifiedTextOperatorStyle = defineSlotStyle({
  slot: "crud-unified-text-operator",
  base: "border-r text-muted-foreground",
  variants: {
    interactive: { true: "gap-0.5 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]", false: "" },
  },
  defaultVariants: { interactive: false },
});
