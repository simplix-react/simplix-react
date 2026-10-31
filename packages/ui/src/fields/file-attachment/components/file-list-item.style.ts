import { defineSlotStyle } from "../../../design/slot-style";

/** One file or image row. */
export const fileListItemStyle = defineSlotStyle({
  slot: "file-list-item",
  base: "rounded border bg-card transition-shadow",
  variants: {
    // The error border replaces the resting border, so each sits in its own value.
    tone: { default: "border-input", error: "border-destructive/30" },
    busy: { true: "opacity-70", false: "" },
    dragging: { true: "shadow-lg", false: "" },
  },
  defaultVariants: { tone: "default", busy: false, dragging: false },
});

/** The main row; gaps and padding step up with container width. */
export const fileListItemRowStyle = defineSlotStyle({
  slot: "file-list-item-row",
  base: "gap-2 px-2 py-1.5 @md:gap-2.5 @md:px-2.5",
  variants: {},
  defaultVariants: {},
});

/** The file name. */
export const fileListItemNameStyle = defineSlotStyle({
  slot: "file-list-item-name",
  base: "text-sm font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The action buttons. */
export const fileListItemActionsStyle = defineSlotStyle({
  slot: "file-list-item-actions",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** The progress expansion of an uploading row. */
export const fileListItemProgressStyle = defineSlotStyle({
  slot: "file-list-item-progress",
  base: "border-t border-dashed px-4 py-1.5 bg-muted/40",
  variants: {},
  defaultVariants: {},
});

/** The error expansion of a failed row. */
export const fileListItemErrorStyle = defineSlotStyle({
  slot: "file-list-item-error",
  base: "gap-1.5 border-t border-dashed border-destructive/30 bg-destructive/5 px-4 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** The warning glyph in the error expansion. */
export const fileListItemErrorIconStyle = defineSlotStyle({
  slot: "file-list-item-error-icon",
  base: "text-destructive",
  variants: {},
  defaultVariants: {},
});

/** The error message text. */
export const fileListItemErrorMessageStyle = defineSlotStyle({
  slot: "file-list-item-error-message",
  base: "text-(length:--fs-label) leading-(--lh-label) text-destructive",
  variants: {},
  defaultVariants: {},
});

/** The size badge: a part on the badge, which carries its own slot. */
export const fileListItemSizeBadgeStyle = defineSlotStyle({
  slot: "file-list-item-size-badge",
  as: "part",
  base: "text-xs tabular-nums",
  variants: {},
  defaultVariants: {},
});
