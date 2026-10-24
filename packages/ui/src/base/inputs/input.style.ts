import { defineSlotStyle } from "../../design/slot-style";

/** The text input's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const inputStyle = defineSlotStyle({
  slot: "input",
  base: "rounded-md border border-input bg-background px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground focus-visible:shadow-[var(--focus-halo)] aria-[invalid=true]:focus-visible:shadow-[var(--invalid-halo)] aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});
