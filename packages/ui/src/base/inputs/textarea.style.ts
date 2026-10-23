import { defineSlotStyle } from "../../design/slot-style";

/** The textarea's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const textareaStyle = defineSlotStyle({
  slot: "textarea",
  base: "rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});
