import { defineSlotStyle } from "../../design/slot-style";

/**
 * The bordered chip that holds a filter's trigger, its value and its clear button.
 *
 * <p>The separator and the badges inside are the shared `Separator` and `Badge`, whose own slots
 * are fixed, so what the chip changes about them is written as rules against them.
 */
export const crudFilterChipStyle = defineSlotStyle({
  slot: "crud-filter-chip",
  base: "gap-2 rounded-md border px-3 text-sm [&_[data-orientation=vertical]]:mx-1 [&_[data-slot=badge]]:font-normal",
  variants: {
    filled: {
      true: "border-solid",
      false:
        "border-dashed text-muted-foreground [&_[data-orientation=vertical]]:opacity-0 [&_[data-slot=badge]]:opacity-0",
    },
  },
  defaultVariants: { filled: false },
});

/** The button inside a chip that opens the chip's picker. */
export const crudFilterChipTriggerStyle = defineSlotStyle({
  slot: "crud-filter-chip-trigger",
  base: "gap-2 rounded-sm focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The button that opens the menu of operators (or fields) of a filter. */
export const crudFilterOperatorTriggerStyle = defineSlotStyle({
  slot: "crud-filter-operator-trigger",
  base: "gap-0.5 bg-muted/50 px-2 text-muted-foreground hover:text-foreground",
  variants: {
    // `chip` draws a bordered button of its own; `joined` sits against the input's left edge.
    attach: { chip: "rounded-md border", joined: "rounded-l-md border-r" },
    labelled: { true: "text-xs font-medium", false: "" },
  },
  defaultVariants: { attach: "chip", labelled: false },
});

/**
 * Wraps the items of an operator (or field) menu.
 *
 * <p>The menu opens in a portal and its items are the shared `DropdownMenuItem`, so the item for
 * the current choice carries `data-current` and this wrapper draws it.
 */
export const crudFilterOperatorMenuStyle = defineSlotStyle({
  slot: "crud-filter-operator-menu",
  base: "[&_[data-current=true]]:bg-accent [&_[data-current]>svg]:mr-2 [&_[data-slot=badge]]:ml-auto [&_[data-slot=badge]]:text-[10px]",
  variants: {},
  defaultVariants: {},
});

/** The tick box in front of an option of a multi-select list. */
export const crudFilterOptionCheckStyle = defineSlotStyle({
  slot: "crud-filter-option-check",
  base: "mr-2 rounded-sm border border-primary",
  variants: {
    selected: {
      true: "bg-primary text-primary-foreground",
      false: "opacity-50 [&_svg]:invisible",
    },
  },
  defaultVariants: { selected: false },
});

/** The icon an option carries in front of its label. */
export const crudFilterOptionIconStyle = defineSlotStyle({
  slot: "crud-filter-option-icon",
  base: "mr-2 text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The label of the entry that clears a list's selection. */
export const crudFilterClearEntryStyle = defineSlotStyle({
  slot: "crud-filter-clear-entry",
  base: "text-center",
  variants: {},
  defaultVariants: {},
});

/**
 * A filter row: an optional leading control, an input and a clear button.
 *
 * <p>The input is the shared `Input`, whose own slot is fixed, so the padding that makes room for
 * the controls around it is written as a rule on the row against its input child.
 */
export const crudFilterInputRowStyle = defineSlotStyle({
  slot: "crud-filter-input-row",
  base: "gap-4 [&>svg]:text-muted-foreground [&>input]:pr-8 [&>input]:text-sm",
  variants: {
    // What sits at the input's left edge decides how far its text is pushed in.
    lead: {
      icon: "[&>input]:pl-8",
      operator: "[&>input]:pl-14",
      field: "[&>input]:pl-24",
      both: "[&>input]:pl-32",
    },
  },
  defaultVariants: { lead: "icon" },
});

/** The icon that stands in for the operator menu when a filter has one operator. */
export const crudFilterInputIconStyle = defineSlotStyle({
  slot: "crud-filter-input-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
