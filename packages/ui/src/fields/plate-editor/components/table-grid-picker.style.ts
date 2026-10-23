import { defineSlotStyle } from "../../../design/slot-style";

/** The grid picker panel. */
export const plateTableGridStyle = defineSlotStyle({
  slot: "plate-table-grid",
  base: "p-2",
  variants: {},
  defaultVariants: {},
});

/** The grid of cells. */
export const plateTableGridCellsStyle = defineSlotStyle({
  slot: "plate-table-grid-cells",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** One grid cell. */
export const plateTableGridCellStyle = defineSlotStyle({
  slot: "plate-table-grid-cell",
  base: "border rounded-[2px] transition-colors",
  variants: {
    // The highlighted colours replace the resting ones, so each sits in its own value.
    highlighted: {
      true: "bg-primary border-primary",
      false: "border-border bg-background hover:border-primary/50",
    },
  },
  defaultVariants: { highlighted: false },
});

/** The size label under the grid. */
export const plateTableGridLabelStyle = defineSlotStyle({
  slot: "plate-table-grid-label",
  base: "mt-2 text-center text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
