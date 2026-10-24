import { defineSlotStyle } from "../../../design/slot-style";

/** The fixed toolbar; only the floating-effect properties transition, not all (prevents animation on hidden toggle). */
export const plateFixedToolbarStyle = defineSlotStyle({
  slot: "plate-fixed-toolbar",
  base: "gap-0.5 px-1 border-border transition-[top,margin,padding,border-radius,box-shadow,transform,background-color] duration-200 ease-out",
  variants: {
    // The floating state replaces the resting border, background and padding, so each sits in its own value.
    floating: {
      true: "mx-2 rounded-lg border shadow-md scale-[0.98] py-1 bg-background/95 backdrop-blur-sm",
      false: "border-b bg-muted/40 py-0.5",
    },
  },
  defaultVariants: { floating: false },
});

/** The sentinel that detects the sticky state. */
export const plateToolbarSentinelStyle = defineSlotStyle({
  slot: "plate-toolbar-sentinel",
  base: "-mb-px",
  variants: {},
  defaultVariants: {},
});

/** A group of related toolbar buttons. */
export const plateToolbarGroupStyle = defineSlotStyle({
  slot: "plate-toolbar-group",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** A toolbar button. */
export const plateToolbarButtonStyle = defineSlotStyle({
  slot: "plate-toolbar-button",
  base: "rounded px-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none disabled:opacity-50 focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    pressed: { true: "bg-accent text-accent-foreground", false: "" },
  },
  defaultVariants: { pressed: false },
});

/** The vertical separator: a part on the separator, which carries its own slot. */
export const plateToolbarSeparatorStyle = defineSlotStyle({
  slot: "plate-toolbar-separator",
  as: "part",
  base: "mx-0.5",
  variants: {},
  defaultVariants: {},
});

/** The tooltip of a toolbar button: a part on the tooltip content, which carries its own slot. */
export const plateToolbarTooltipStyle = defineSlotStyle({
  slot: "plate-toolbar-tooltip",
  as: "part",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});
