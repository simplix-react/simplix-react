import { defineSlotStyle } from "../../design/slot-style";

/** The select trigger's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const selectTriggerStyle = defineSlotStyle({
  slot: "select-trigger",
  base: "rounded-md border border-input bg-background placeholder:text-muted-foreground focus:border-foreground focus-visible:shadow-[var(--focus-halo)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 focus-visible:outline-none",
  variants: {
    size: {
      default: "h-8 px-3 py-1.5 text-sm",
      sm: "h-7 px-2 py-1 text-xs",
      xs: "h-6 px-2 py-0.5 text-xs",
    },
    /** A trigger packed into a row of controls: tighter gap, medium weight. */
    compact: { true: "gap-1 font-medium", false: "" },
  },
  defaultVariants: { size: "default", compact: false },
});

/** The select dropdown panel's classic look. */
export const selectContentStyle = defineSlotStyle({
  slot: "select-content",
  base: "rounded-[var(--radius-overlay)] border bg-popover text-popover-foreground shadow-md duration-[var(--dur-base)] ease-[var(--ease-spring)] data-[state=closed]:ease-[var(--ease)]",
  variants: {
    position: {
      popper: "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      "item-aligned": "",
    },
  },
  defaultVariants: { position: "popper" },
});

/** The scrolling viewport inside the select panel. */
export const selectViewportStyle = defineSlotStyle({
  slot: "select-viewport",
  base: "p-1",
  variants: {},
  defaultVariants: {},
});

/** One select option row. */
export const selectItemStyle = defineSlotStyle({
  slot: "select-item",
  base: "rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** A group label inside the select panel. */
export const selectLabelStyle = defineSlotStyle({
  slot: "select-label",
  base: "py-1.5 pl-8 pr-2 text-sm font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The line between select groups. */
export const selectSeparatorStyle = defineSlotStyle({
  slot: "select-separator",
  base: "-mx-1 my-1 bg-muted",
  variants: {},
  defaultVariants: {},
});
