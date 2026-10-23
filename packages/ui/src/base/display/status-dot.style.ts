import { defineSlotStyle } from "../../design/slot-style";

/** The wrapper of a status dot. */
export const statusDotStyle = defineSlotStyle({
  slot: "status-dot",
  base: "",
  variants: {
    /** An inactive indicator reads as "off". */
    active: { true: "", false: "opacity-60" },
  },
  defaultVariants: { active: true },
});

/** The animated ring behind a status dot. */
export const statusDotRingStyle = defineSlotStyle({
  slot: "status-dot-ring",
  base: "rounded-full opacity-75",
  variants: {
    animation: { ping: "animate-ping", flash: "animate-status-flash" },
  },
  defaultVariants: { animation: "ping" },
});

/** The solid dot itself. */
export const statusDotCoreStyle = defineSlotStyle({
  slot: "status-dot-core",
  base: "rounded-full",
  variants: {},
  defaultVariants: {},
});
