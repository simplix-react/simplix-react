import { defineSlotStyle } from "../../design/slot-style";

/** A pill of a chip row ({@link ChipFilter}, {@link ChoiceChips}). Drawn by `theme/designs/classic.css`. */
export const crudChipFilterChipStyle = defineSlotStyle({
  slot: "crud-chip-filter-chip",
  base: "gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,scale] duration-[var(--dur-fast)] active:scale-[0.98]",
  variants: {
    state: {
      idle: "border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      // The chosen chip reads by its ground; it carries no check mark.
      active: "border-transparent bg-primary text-primary-foreground [&>svg]:!hidden",
      disabled: "border-transparent bg-muted/50 text-muted-foreground/40",
    },
  },
  defaultVariants: { state: "idle" },
});

/** The label inside a chip; struck through while the chip is disabled. */
export const crudChipFilterLabelStyle = defineSlotStyle({
  slot: "crud-chip-filter-label",
  base: "",
  variants: {
    disabled: { true: "line-through opacity-50", false: "" },
  },
  defaultVariants: { disabled: false },
});

/** The empty ring of a chip that is off and carries no icon of its own. */
export const crudChipFilterIdleMarkStyle = defineSlotStyle({
  slot: "crud-chip-filter-idle-mark",
  // A chip reads as off by its ground; it carries no empty mark (the element's own inline-flex
  // is a utility, so the rule needs the important flag).
  base: "!hidden",
  variants: {},
  defaultVariants: {},
});
