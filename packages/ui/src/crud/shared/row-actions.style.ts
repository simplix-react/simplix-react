import { defineSlotStyle } from "../../design/slot-style";

/**
 * The bordered strip that groups a row's icon actions. It shows on the row being pointed at,
 * focused, open or stood on by the keyboard, sliding 4px in from the end; where there is no hover
 * it always shows.
 */
export const rowActionsStripStyle = defineSlotStyle({
  slot: "row-actions-strip",
  base: "[--focus-halo:var(--focus-halo-inset)] rounded-md border opacity-0 translate-x-1 transition-[opacity,translate] duration-[var(--dur-base)] ease-[var(--ease)] [tr:hover_&]:ease-[var(--ease-spring)] [tr:focus-within_&]:ease-[var(--ease-spring)] [tr:hover_&]:opacity-100 [tr:hover_&]:translate-x-0 [tr:focus-within_&]:opacity-100 [tr:focus-within_&]:translate-x-0 [tr[data-part-active=true]_&]:opacity-100 [tr[data-part-active=true]_&]:translate-x-0 [tr[data-part-focused=true]_&]:opacity-100 [tr[data-part-focused=true]_&]:translate-x-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-x-0",
  variants: {},
  defaultVariants: {},
});

/** An icon action inside the strip: square-cornered, ruled off from the one before it. */
export const rowActionsStripButtonStyle = defineSlotStyle({
  slot: "row-actions-strip-button",
  as: "part",
  base: "rounded-none transition-[background-color,color,scale] duration-[var(--dur-fast)] active:scale-[0.98]",
  variants: { ruled: { true: "border-l", false: "" } },
  defaultVariants: { ruled: false },
});
