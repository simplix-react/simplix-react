import { defineSlotStyle } from "../../design/slot-style";

/** The language selector's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const languageSelectorStyle = defineSlotStyle({
  slot: "field-language-selector",
  base: "rounded-md border border-input bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The previous / next buttons at either end of the language row. */
export const languageStepStyle = defineSlotStyle({
  slot: "field-language-step",
  base: "border-input hover:bg-muted-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    side: { prev: "border-r", next: "border-l" },
  },
  defaultVariants: { side: "prev" },
});

/** The chevron glyph inside a step button. */
export const languageChevronStyle = defineSlotStyle({
  slot: "field-language-chevron",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The language select trigger: a part on the trigger, which carries the select component's own slot. */
export const languageTriggerStyle = defineSlotStyle({
  slot: "field-language-trigger",
  as: "part",
  base: "border-0 !bg-transparent dark:!bg-transparent !p-0 !py-0 text-[10px] leading-none shadow-none [&>span]:leading-none",
  variants: {},
  defaultVariants: {},
});

/** A language option: a part on the select item, which carries its own slot. */
export const languageItemStyle = defineSlotStyle({
  slot: "field-language-item",
  as: "part",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/** The dot showing whether a language has content. */
export const languageDotStyle = defineSlotStyle({
  slot: "field-language-dot",
  base: "rounded-full",
  variants: {
    filled: { true: "bg-green-500", false: "bg-muted-foreground/30" },
  },
  defaultVariants: { filled: false },
});

/** The strip of per-language segments under the selector. */
export const languageSegmentsStyle = defineSlotStyle({
  slot: "field-language-segments",
  base: "mx-1 mb-0.5 rounded-sm",
  variants: {},
  defaultVariants: {},
});

/** One language's segment in the strip. */
export const languageSegmentStyle = defineSlotStyle({
  slot: "field-language-segment",
  base: "transition-colors disabled:cursor-not-allowed",
  variants: {
    filled: { true: "bg-green-500", false: "bg-muted-foreground/30" },
    current: { true: "ring-1 ring-inset ring-foreground/50", false: "" },
  },
  defaultVariants: { filled: false, current: false },
});

/** The dot and name of a language, in the trigger (tight) and in the option list (wide). */
export const languageNameStyle = defineSlotStyle({
  slot: "field-language-name",
  base: "",
  variants: {
    spacing: { tight: "gap-1.5", wide: "gap-2" },
  },
  defaultVariants: { spacing: "tight" },
});
