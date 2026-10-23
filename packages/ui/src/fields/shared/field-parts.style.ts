import { defineSlotStyle } from "../../design/slot-style";

/** The small button that clears a field's value. */
export const fieldClearButtonStyle = defineSlotStyle({
  slot: "field-clear-button",
  base: "rounded-sm text-muted-foreground hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The button that fills a field from the environment (detect the time zone, locate on a map). */
export const fieldDetectButtonStyle = defineSlotStyle({
  slot: "field-detect-button",
  base: "rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The check mark in front of an option of a searchable list; invisible unless the option is chosen. */
export const fieldOptionCheckStyle = defineSlotStyle({
  slot: "field-option-check",
  base: "mr-2",
  variants: {
    selected: { true: "opacity-100", false: "opacity-0" },
  },
  defaultVariants: { selected: false },
});

/** The primary line of an option. */
export const fieldOptionLabelStyle = defineSlotStyle({
  slot: "field-option-label",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});

/** The secondary line of an option. */
export const fieldOptionHintStyle = defineSlotStyle({
  slot: "field-option-hint",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A short code (currency, calling code) shown in monospace. */
export const fieldCodeStyle = defineSlotStyle({
  slot: "field-code",
  base: "font-mono text-xs",
  variants: {
    spaced: { true: "mr-2", false: "" },
  },
  defaultVariants: { spaced: false },
});

/** The selected value shown inside a select trigger. */
export const fieldSelectedValueStyle = defineSlotStyle({
  slot: "field-selected-value",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** A country flag glyph inside a field; the flag component renders a bare `<svg>` and writes no slot. */
export const fieldFlagStyle = defineSlotStyle({
  slot: "field-flag",
  base: "rounded-[1px]",
  variants: {
    spaced: { true: "mr-2", false: "" },
  },
  defaultVariants: { spaced: false },
});

/** How a field draws the input it renders: the input carries its own slot, so this is a part on it. */
export const fieldControlStyle = defineSlotStyle({
  slot: "field-control",
  as: "part",
  base: "",
  variants: {
    // The part outranks the input's own focus rule, so the focused border is drawn again here: an
    // invalid input turns to the focus colour while focused, as the input does on its own.
    invalid: { true: "border-destructive focus-visible:border-foreground", false: "" },
    mono: { true: "font-mono", false: "" },
    padded: { true: "pr-10", false: "" },
  },
  defaultVariants: { invalid: false, mono: false, padded: false },
});

/** The column holding an upload field's dropzone, list and previews. */
export const fieldUploadStackStyle = defineSlotStyle({
  slot: "field-upload-stack",
  base: "gap-4",
  variants: {},
  defaultVariants: {},
});

/** The list of messages in an upload field's validation dialog. */
export const fieldValidationListStyle = defineSlotStyle({
  slot: "field-validation-list",
  base: "space-y-1 text-sm",
  variants: {},
  defaultVariants: {},
});

/** The empty square shown where an image thumbnail would be. */
export const fieldThumbnailPlaceholderStyle = defineSlotStyle({
  slot: "field-thumbnail-placeholder",
  base: "rounded-sm bg-muted",
  variants: {},
  defaultVariants: {},
});
