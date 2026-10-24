import { defineSlotStyle } from "../../design/slot-style";

/** The pulsing placeholder drawn while content loads. */
export const skeletonStyle = defineSlotStyle({
  slot: "skeleton",
  base: "rounded-md bg-muted bg-[linear-gradient(90deg,var(--muted),var(--shimmer),var(--muted))] bg-[length:200%_100%] animate-skeleton-shine motion-reduce:animate-none",
  variants: {},
  defaultVariants: {},
});
