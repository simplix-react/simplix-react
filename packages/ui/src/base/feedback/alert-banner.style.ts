import { defineSlotStyle } from "../../design/slot-style";

/** The banner's container. The tone's surface classes arrive from the status tone context. */
export const alertBannerStyle = defineSlotStyle({
  slot: "alert-banner",
  base: "rounded-md border",
  variants: {
    density: {
      default: "px-4 py-3",
      sm: "px-3 py-2",
      hint: "p-2.5",
    },
    /** A borderless banner replaces the tone surface with a transparent one. */
    borderless: { true: "border-transparent bg-transparent", false: "" },
  },
  defaultVariants: { density: "default", borderless: false },
});

/**
 * The title line.
 *
 * One type scale across `default` and `sm`, which differ in the room they take and not in what a
 * title is. Given its own scale, `default` read 14/600 over a 14px body while every `sm` banner,
 * and every notice card, which is one, read 14/500 over 12px muted: the same box at two sizes
 * depending on which file drew it. `hint` keeps its smaller title; it is the one density that
 * means "smaller", rather than "roomier".
 */
export const alertBannerTitleStyle = defineSlotStyle({
  slot: "alert-banner-title",
  // No leading class: the font size's own line height is the one drawn (a `leading-*` here
  // would outrank it).
  base: "",
  variants: {
    density: {
      default: "text-sm font-medium",
      sm: "text-sm font-medium",
      hint: "text-xs",
    },
  },
  defaultVariants: { density: "default" },
});

/** The line under the title. */
export const alertBannerSubtitleStyle = defineSlotStyle({
  slot: "alert-banner-subtitle",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
