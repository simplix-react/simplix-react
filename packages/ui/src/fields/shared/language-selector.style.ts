import { defineSlotStyle } from "../../design/slot-style";

/** The language selector's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const languageSelectorStyle = defineSlotStyle({
  slot: "field-language-selector",
  base: "",
  variants: {
    placement: {
      label: "rounded-md border border-input bg-muted",
      inset: "rounded-sm bg-muted",
    },
  },
  defaultVariants: { placement: "label" },
});

/** The previous / next buttons at either end of the language row. */
export const languageStepStyle = defineSlotStyle({
  slot: "field-language-step",
  base: "border-input hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:bg-muted-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed",
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
  base: "border-0 !bg-transparent dark:!bg-transparent !p-0 !py-0 text-(length:--fs-2xs) leading-none shadow-none [&>span]:leading-none focus-visible:!shadow-none focus-visible:!bg-muted-foreground/20 dark:focus-visible:!bg-muted-foreground/20",
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
  base: "transition-colors focus-visible:outline-none focus-visible:bg-foreground/60 disabled:cursor-not-allowed",
  variants: {
    filled: { true: "bg-green-500", false: "bg-muted-foreground/30" },
    current: { true: "", false: "opacity-50" },
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

/**
 * The frame holding a field's control with the language selector drawn inside it. The selector
 * takes the control's inline-end segment (an input) or column (a textarea), and the fill bar runs
 * along the control's bottom edge.
 */
export const languageInsetStyle = defineSlotStyle({
  slot: "field-language-inset",
  base: "flex flex-col rounded-md",
  variants: {
    control: { input: "", textarea: "" },
  },
  defaultVariants: { control: "input" },
});

/**
 * The layer laid over the control's padding box, inside its border, that holds the selector and
 * the fill bar and clips them to the control's rounded corners.
 */
export const languageInsetOverlayStyle = defineSlotStyle({
  slot: "field-language-inset-overlay",
  base: "pointer-events-none inset-px overflow-hidden rounded-md",
  variants: {},
  defaultVariants: {},
});

/** The box that places the selector at the inline end of the control, its full height. */
export const languageInsetAnchorStyle = defineSlotStyle({
  slot: "field-language-inset-anchor",
  base: "pointer-events-auto inset-y-0 end-0",
  variants: {
    control: { input: "", textarea: "" },
  },
  defaultVariants: { control: "input" },
});

/**
 * The input's language segment: the select trigger filling the selector's box. Keyboard focus is a
 * background tint, never a border or a ring.
 */
export const languageInsetTriggerStyle = defineSlotStyle({
  slot: "field-language-inset-trigger",
  as: "part",
  base: "!h-full !min-h-0 w-full !rounded-none border-0 !bg-muted/50 !px-2 !py-0 gap-1.5 text-(length:--fs-2xs) leading-none shadow-none hover:!bg-muted focus:!shadow-none focus-visible:!shadow-none focus-visible:!bg-muted [&>svg:not([data-slot=field-language-mark])]:hidden",
  variants: {},
  defaultVariants: {},
});

/** The textarea's language column: one row per language, scrolling when they outgrow the control. */
export const languageListStyle = defineSlotStyle({
  slot: "field-language-list",
  base: "h-full overflow-y-auto overscroll-contain bg-muted/50 pb-0.5",
  variants: {},
  defaultVariants: {},
});

/** One language's row in the textarea's column. */
export const languageOptionStyle = defineSlotStyle({
  slot: "field-language-option",
  base: "w-full gap-1.5 px-2 py-1.5 text-(length:--fs-2xs) leading-none text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    current: { true: "text-foreground", false: "" },
  },
  defaultVariants: { current: false },
});

/** The mark ending the input's segment (a chevron) or a column row (a check on the current one). */
export const languageMarkStyle = defineSlotStyle({
  slot: "field-language-mark",
  base: "size-3 shrink-0 text-muted-foreground",
  variants: {
    shown: { true: "", false: "invisible" },
  },
  defaultVariants: { shown: true },
});

/** The per-language fill indicator along the bottom of the whole control. */
export const languageFillBarStyle = defineSlotStyle({
  slot: "field-language-fill-bar",
  base: "pointer-events-none inset-x-0 bottom-0 h-0.5 gap-px",
  variants: {},
  defaultVariants: {},
});

/** One language's segment in the fill bar: green where the language has text. */
export const languageFillStyle = defineSlotStyle({
  slot: "field-language-fill",
  base: "transition-colors",
  variants: {
    filled: { true: "bg-green-500", false: "bg-border" },
    current: { true: "", false: "opacity-50" },
  },
  defaultVariants: { filled: false, current: false },
});
