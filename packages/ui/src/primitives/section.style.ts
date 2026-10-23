import { defineSlotStyle } from "../design/slot-style";

/** The section primitive's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const sectionStyle = defineSlotStyle({
  slot: "section",
  base: "space-y-4",
  variants: {},
  defaultVariants: {},
});

/** The heading of a section. */
export const sectionTitleStyle = defineSlotStyle({
  slot: "section-title",
  base: "text-lg font-semibold tracking-tight",
  variants: {},
  defaultVariants: {},
});

/** The descriptive text under a section heading. */
export const sectionDescriptionStyle = defineSlotStyle({
  slot: "section-description",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
