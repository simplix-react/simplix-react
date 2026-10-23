import { defineSlotStyle } from "../../design/slot-style";

/** The empty-state placeholder; `sm` is the panel-section weight. */
export const emptyStateStyle = defineSlotStyle({
  slot: "empty-state",
  base: "rounded-lg border px-6 text-center",
  variants: { size: { sm: "py-5", default: "py-16" } },
  defaultVariants: { size: "default" },
});

/** The round badge around the icon. */
export const emptyStateIconStyle = defineSlotStyle({
  slot: "empty-state-icon",
  base: "rounded-full bg-muted text-muted-foreground",
  variants: { size: { sm: "mb-2", default: "mb-3" } },
  defaultVariants: { size: "default" },
});

/** The title line. */
export const emptyStateTitleStyle = defineSlotStyle({
  slot: "empty-state-title",
  base: "font-semibold",
  variants: { size: { sm: "text-sm", default: "text-base" } },
  defaultVariants: { size: "default" },
});

/** The description line. */
export const emptyStateDescriptionStyle = defineSlotStyle({
  slot: "empty-state-description",
  base: "mt-1 text-muted-foreground",
  variants: { size: { sm: "text-xs", default: "text-sm" } },
  defaultVariants: { size: "default" },
});

/** The block holding the action. */
export const emptyStateActionStyle = defineSlotStyle({
  slot: "empty-state-action",
  base: "",
  variants: { size: { sm: "mt-2", default: "mt-4" } },
  defaultVariants: { size: "default" },
});

/** The quiet line under the action. */
export const emptyStateFooterStyle = defineSlotStyle({
  slot: "empty-state-footer",
  base: "text-muted-foreground text-xs",
  variants: { size: { sm: "mt-2", default: "mt-4" } },
  defaultVariants: { size: "default" },
});
