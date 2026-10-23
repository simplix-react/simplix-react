import { defineSlotStyle } from "../../../design/slot-style";

/** The scrolling wrapper around a table. */
export const plateTableScrollStyle = defineSlotStyle({
  slot: "plate-table-scroll",
  base: "my-4",
  variants: {},
  defaultVariants: {},
});

/** The table element. */
export const plateTableStyle = defineSlotStyle({
  slot: "plate-table",
  base: "border-collapse border border-border",
  variants: {},
  defaultVariants: {},
});

/** A table row. */
export const plateTableRowStyle = defineSlotStyle({
  slot: "plate-table-row",
  base: "border-b border-border",
  variants: {},
  defaultVariants: {},
});

/** A table cell. */
export const plateTableCellStyle = defineSlotStyle({
  slot: "plate-table-cell",
  base: "border border-border p-2 text-left",
  variants: {
    header: { true: "bg-muted font-semibold", false: "" },
  },
  defaultVariants: { header: false },
});

/** A table header cell. */
export const plateTableHeaderCellStyle = defineSlotStyle({
  slot: "plate-table-header-cell",
  base: "border border-border bg-muted p-2 text-left font-semibold",
  variants: {},
  defaultVariants: {},
});
