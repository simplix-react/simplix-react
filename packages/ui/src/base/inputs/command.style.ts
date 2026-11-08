import { defineSlotStyle } from "../../design/slot-style";

/** The command palette root's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const commandStyle = defineSlotStyle({
  slot: "command",
  base: "rounded-md bg-popover text-popover-foreground",
  variants: {},
  defaultVariants: {},
});

/** The row holding the search icon and the input. */
export const commandInputWrapperStyle = defineSlotStyle({
  slot: "command-input-wrapper",
  base: "border-b px-3",
  variants: {},
  defaultVariants: {},
});

/** The magnifier icon in the command input row. */
export const commandInputIconStyle = defineSlotStyle({
  slot: "command-input-icon",
  base: "mr-2 opacity-50",
  variants: {},
  defaultVariants: {},
});

/**
 * The command search field.
 *
 * <p>`outline-none` with nothing put back in the classic design: this field is focused the moment
 * the palette opens and is the only thing in it that takes typing, so the caret is where the
 * keyboard is. The clarity design draws an inward halo on the row that holds the field
 * (`command-input-wrapper`, `focus-within`) so the popover's edge does not cut it.
 */
export const commandInputStyle = defineSlotStyle({
  slot: "command-input",
  base: "h-10 rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The empty-result message. */
export const commandEmptyStyle = defineSlotStyle({
  slot: "command-empty",
  base: "py-6 text-center text-sm",
  variants: {},
  defaultVariants: {},
});

/** A group of command items with its heading. */
export const commandGroupStyle = defineSlotStyle({
  slot: "command-group",
  base: "p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The line between command groups. */
export const commandSeparatorStyle = defineSlotStyle({
  slot: "command-separator",
  base: "-mx-1 bg-border",
  variants: {},
  defaultVariants: {},
});

/**
 * One command option row.
 *
 * <p>`outline-none` with nothing put back: an option row never holds focus - the input keeps
 * it and the cursor moves by `data-[selected=true]`, which paints the accent below.
 */
export const commandItemStyle = defineSlotStyle({
  slot: "command-item",
  base: "gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
  variants: {},
  defaultVariants: {},
});
