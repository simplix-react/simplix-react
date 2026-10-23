import { defineSlotStyle } from "../../design/slot-style";

/** The profile strip at the top of a detail or form modal. */
export const detailProfileStyle = defineSlotStyle({
  slot: "detail-profile",
  base: "gap-x-4 gap-y-1 border-b border-border bg-surface-2 px-6 py-4",
  variants: {},
  defaultVariants: {},
});

/** The square mark at the strip's start. */
export const detailProfileMarkStyle = defineSlotStyle({
  slot: "detail-profile-mark",
  base: "rounded-[12px] bg-primary text-primary-foreground",
  variants: {},
  defaultVariants: {},
});

/** The strip's title. */
export const detailProfileTitleStyle = defineSlotStyle({
  slot: "detail-profile-title",
  as: "part",
  base: "m-0",
  variants: {},
  defaultVariants: {},
});

/** The feature badges at the strip's end. */
export const detailProfileFeatsStyle = defineSlotStyle({
  slot: "detail-profile-feats",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The tooltip listing the badges folded into the "+N" badge. */
export const detailProfileOverflowStyle = defineSlotStyle({
  slot: "detail-profile-overflow",
  as: "part",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The meta row under the title. */
export const detailProfileMetaStyle = defineSlotStyle({
  slot: "detail-profile-meta",
  base: "gap-2.5",
  variants: {},
  defaultVariants: {},
});

/** The code chip in the meta row. */
export const detailProfileCodeStyle = defineSlotStyle({
  slot: "detail-profile-code",
  base: "rounded-[3px] bg-surface-3 px-1.5 py-px font-mono text-xs text-fg-soft",
  variants: {},
  defaultVariants: {},
});

/** The dot between meta items. */
export const detailProfileDotStyle = defineSlotStyle({
  slot: "detail-profile-dot",
  base: "rounded-full bg-muted-2",
  variants: {},
  defaultVariants: {},
});

/** One feature badge in the profile header, tinted with the primary colour. */
export const detailProfileFeatStyle = defineSlotStyle({
  slot: "detail-profile-feat",
  as: "part",
  base: "border-primary/20 bg-primary/10 text-primary",
  variants: {},
  defaultVariants: {},
});
