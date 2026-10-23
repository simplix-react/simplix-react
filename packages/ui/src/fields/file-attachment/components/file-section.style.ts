import { defineSlotStyle } from "../../../design/slot-style";

/** The section column. */
export const fileSectionStyle = defineSlotStyle({
  slot: "file-section",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The section title row. */
export const fileSectionHeaderStyle = defineSlotStyle({
  slot: "file-section-header",
  base: "gap-1.5 text-xs font-semibold text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The item count in the section title. */
export const fileSectionCountStyle = defineSlotStyle({
  slot: "file-section-count",
  base: "tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The sortable list of rows. */
export const fileSectionListStyle = defineSlotStyle({
  slot: "file-section-list",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});
