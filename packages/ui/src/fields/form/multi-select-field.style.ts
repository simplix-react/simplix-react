import { defineSlotStyle } from "../../design/slot-style";

/** The box of a multi-select: chips and the search input inside one bordered control. */
export const multiSelectBoxStyle = defineSlotStyle({
  slot: "field-multiselect-box",
  base: "gap-1 rounded-md border border-input bg-background px-3 text-sm focus-within:outline-none focus-within:border-foreground focus-within:shadow-[var(--focus-halo)]",
  variants: {
    disabled: { true: "cursor-not-allowed opacity-50", false: "" },
    invalid: { true: "border-destructive focus-within:border-destructive focus-within:shadow-[var(--invalid-halo)]", false: "" },
  },
  defaultVariants: { disabled: false, invalid: false },
});

/** The row holding the chips and the search input. */
export const multiSelectChipsStyle = defineSlotStyle({
  slot: "field-multiselect-chips",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** A chip of a multi-select: a part on the badge, which carries its own slot. */
export const multiSelectChipStyle = defineSlotStyle({
  slot: "field-multiselect-chip",
  as: "part",
  base: "gap-0.5 pr-0.5 text-(length:--fs-label) leading-(--lh-label) py-0",
  variants: {},
  defaultVariants: {},
});

/** The button that removes a chip. */
export const multiSelectRemoveStyle = defineSlotStyle({
  slot: "field-multiselect-remove",
  base: "ml-0.5 rounded-sm hover:bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The search input inside the box. */
export const multiSelectInputStyle = defineSlotStyle({
  slot: "field-multiselect-input",
  // `outline-none` with nothing put back: the box around this input carries
  // `focus-within:border-foreground`, so focus shows on the whole control.
  base: "bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed",
  variants: {},
  defaultVariants: {},
});

/** The option list. */
export const multiSelectListStyle = defineSlotStyle({
  slot: "field-multiselect-list",
  base: "p-1",
  variants: {},
  defaultVariants: {},
});

/** One option row. */
export const multiSelectOptionStyle = defineSlotStyle({
  slot: "field-multiselect-option",
  // `outline-none` with nothing put back: the input keeps focus and this row is pointed at by
  // hover and by the selected accent.
  base: "rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
  variants: {
    selected: { true: "bg-accent/50", false: "" },
  },
  defaultVariants: { selected: false },
});

/** The check box in front of an option. */
export const multiSelectCheckStyle = defineSlotStyle({
  slot: "field-multiselect-check",
  base: "mr-2 rounded-sm border border-primary",
  variants: {
    selected: { true: "bg-primary text-primary-foreground", false: "opacity-50" },
  },
  defaultVariants: { selected: false },
});
