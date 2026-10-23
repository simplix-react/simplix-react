import { defineSlotStyle } from "../../design/slot-style";

/** The padded content area of a card; the density sets how much padding it draws. */
export const crudCardBodyStyle = defineSlotStyle({
  slot: "crud-card-body",
  base: "",
  variants: {
    density: {
      compact: "px-3 py-2",
      default: "px-4 py-3",
      comfortable: "px-5 py-4",
    },
    // A card with a title row has the title's own padding above, so its content starts closer.
    titled: { true: "pt-2", false: "" },
  },
  defaultVariants: { density: "default", titled: false },
});

/** A card in a reorderable or selectable card list. */
export const crudCardStyle = defineSlotStyle({
  slot: "crud-card",
  base: "rounded-lg border transition-colors hover:bg-muted/50",
  variants: {
    selected: { true: "ring-2 ring-primary", false: "" },
    active: { true: "bg-muted/50", false: "" },
    dragging: { true: "opacity-50", false: "" },
  },
  defaultVariants: { selected: false, active: false, dragging: false },
});

/** The title row of a card. */
export const crudCardHeaderStyle = defineSlotStyle({
  slot: "crud-card-header",
  as: "part",
  base: "border-b px-1 py-1.5 gap-1",
  variants: {},
  defaultVariants: {},
});

/** The actions and checkbox at a card title's end. */
export const crudCardActionsStyle = defineSlotStyle({
  slot: "crud-card-actions",
  as: "part",
  base: "ml-2",
  variants: {},
  defaultVariants: {},
});

/** The selection checkbox of a card or a table row. */
export const crudSelectCheckboxStyle = defineSlotStyle({
  slot: "crud-select-checkbox",
  base: "rounded border-gray-300",
  variants: {},
  defaultVariants: {},
});

/** The loading placeholder of a card; it takes the same padding as the card it stands for. */
export const crudCardSkeletonStyle = defineSlotStyle({
  slot: "crud-card-skeleton",
  base: "rounded-lg border",
  variants: {
    density: {
      compact: "px-3 py-2",
      default: "px-4 py-3",
      comfortable: "px-5 py-4",
    },
  },
  defaultVariants: { density: "default" },
});
