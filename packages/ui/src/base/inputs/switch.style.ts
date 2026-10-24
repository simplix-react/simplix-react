import { defineSlotStyle } from "../../design/slot-style";

/** The switch track's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const switchStyle = defineSlotStyle({
  slot: "switch",
  base: "inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    size: {
      default: "h-6 w-11",
      sm: "h-4 w-7",
    },
  },
  defaultVariants: { size: "default" },
});

/** The switch thumb's classic look. */
export const switchThumbStyle = defineSlotStyle({
  slot: "switch-thumb",
  base: "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  variants: {
    size: {
      default: "h-5 w-5 data-[state=checked]:translate-x-5",
      sm: "h-3 w-3 data-[state=checked]:translate-x-3",
    },
  },
  defaultVariants: { size: "default" },
});
