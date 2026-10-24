import { defineSlotStyle } from "../../design/slot-style";

/** The grid of groups. */
export const groupedToggleGridStyle = defineSlotStyle({
  slot: "field-toggle-grid",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** One group's card. */
export const groupedToggleGroupStyle = defineSlotStyle({
  slot: "field-toggle-group",
  base: "rounded-lg border border-border bg-secondary/40 p-3",
  variants: {},
  defaultVariants: {},
});

/** The group header row: a part on the flex row. */
export const groupedToggleHeaderStyle = defineSlotStyle({
  slot: "field-toggle-header",
  as: "part",
  base: "mb-2.5",
  variants: {},
  defaultVariants: {},
});

/** The group title: a part on the flex row that holds the icon and the name. */
export const groupedToggleTitleStyle = defineSlotStyle({
  slot: "field-toggle-title",
  as: "part",
  base: "gap-1.5 text-sm font-medium text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The icon before a group title. */
export const groupedToggleIconStyle = defineSlotStyle({
  slot: "field-toggle-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The select-all label of a group. */
export const groupedToggleSelectAllStyle = defineSlotStyle({
  slot: "field-toggle-select-all",
  base: "gap-1.5 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The chip row: a part on the flex row. */
export const groupedToggleChipsStyle = defineSlotStyle({
  slot: "field-toggle-chips",
  as: "part",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** One toggle chip. */
export const groupedToggleChipStyle = defineSlotStyle({
  slot: "field-toggle-chip",
  base: "gap-1 rounded-sm border px-2 py-0.5 text-xs transition-all border-transparent bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-muted-foreground focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    pressed: {
      true: "border-primary bg-primary/20 font-semibold text-primary hover:bg-primary/25 hover:text-primary",
      false: "",
    },
  },
  defaultVariants: { pressed: false },
});

/** The check mark inside a chip. */
export const groupedToggleCheckStyle = defineSlotStyle({
  slot: "field-toggle-check",
  base: "",
  variants: {
    pressed: { true: "opacity-100", false: "opacity-50" },
  },
  defaultVariants: { pressed: false },
});

/** The note about selections outside the groups. */
export const groupedToggleNoteStyle = defineSlotStyle({
  slot: "field-toggle-note",
  base: "mt-3 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
