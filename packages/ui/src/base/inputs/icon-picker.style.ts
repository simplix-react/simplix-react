import { defineSlotStyle } from "../../design/slot-style";

/** The icon picker's default trigger button. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const iconPickerTriggerStyle = defineSlotStyle({
  slot: "icon-picker-trigger",
  base: "gap-2 rounded-md border px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The category list and icon grid side by side. */
export const iconPickerBodyStyle = defineSlotStyle({
  slot: "icon-picker-body",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** The scrolling category column. */
export const iconPickerCategoriesStyle = defineSlotStyle({
  slot: "icon-picker-categories",
  base: "border-r pr-2",
  variants: {},
  defaultVariants: {},
});

/** The stack of category buttons. */
export const iconPickerCategoryListStyle = defineSlotStyle({
  slot: "icon-picker-category-list",
  base: "space-y-0.5",
  variants: {},
  defaultVariants: {},
});

/** One category button. */
export const iconPickerCategoryStyle = defineSlotStyle({
  slot: "icon-picker-category",
  base: "rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground",
  variants: {
    selected: {
      true: "bg-primary/10 font-medium text-primary",
      false: "text-muted-foreground",
    },
  },
  defaultVariants: { selected: false },
});

/** The icon count pill in a category button. */
export const iconPickerCategoryCountStyle = defineSlotStyle({
  slot: "icon-picker-category-count",
  base: "rounded-full bg-muted px-1.5 text-[10px]",
  variants: {
    spaced: { true: "ml-1", false: "" },
  },
  defaultVariants: { spaced: false },
});

/** The message shown when no icon matches. */
export const iconPickerEmptyStyle = defineSlotStyle({
  slot: "icon-picker-empty",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The grid of icon buttons. */
export const iconPickerGridStyle = defineSlotStyle({
  slot: "icon-picker-grid",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** One icon button. */
export const iconPickerIconStyle = defineSlotStyle({
  slot: "icon-picker-icon",
  base: "rounded-md border transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
  variants: {
    selected: {
      true: "border-primary bg-primary/10",
      false: "",
    },
  },
  defaultVariants: { selected: false },
});

/** The icon name inside an icon button's tooltip. */
export const iconPickerTooltipNameStyle = defineSlotStyle({
  slot: "icon-picker-tooltip-name",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/** The footer row under the picker. */
export const iconPickerFooterStyle = defineSlotStyle({
  slot: "icon-picker-footer",
  base: "mt-2 text-xs",
  variants: {},
  defaultVariants: {},
});

/** The status line in the footer. */
export const iconPickerStatusStyle = defineSlotStyle({
  slot: "icon-picker-status",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The footer's clear button. */
export const iconPickerClearStyle = defineSlotStyle({
  slot: "icon-picker-clear",
  base: "rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground [&>svg]:mr-1",
  variants: {},
  defaultVariants: {},
});

/** The loading placeholder column. */
export const iconPickerSkeletonStyle = defineSlotStyle({
  slot: "icon-picker-skeleton",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The loading placeholder grid. */
export const iconPickerSkeletonGridStyle = defineSlotStyle({
  slot: "icon-picker-skeleton-grid",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The icon picker's popover panel: a part on the popover content, which carries its own slot. */
export const iconPickerPopoverStyle = defineSlotStyle({
  slot: "icon-picker-popover",
  as: "part",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});
