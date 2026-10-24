import { defineSlotStyle } from "../../../design/slot-style";

/** The scrolling container of the editor content. */
export const plateEditorContainerStyle = defineSlotStyle({
  slot: "plate-editor-container",
  base: "bg-background",
  variants: {
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { disabled: false },
});

/** The outer wrapper that gives the toolbar and the editor one border. */
export const plateEditorWrapperStyle = defineSlotStyle({
  slot: "plate-editor-wrapper",
  base: "rounded-md border bg-background transition-[color,box-shadow]",
  variants: {
    // The error colours replace the resting and focus colours, so each sits in its own value.
    invalid: {
      true: "border-destructive focus-within:shadow-[var(--invalid-halo)]",
      false: "border-input focus-within:border-ring focus-within:shadow-[var(--focus-halo)]",
    },
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { invalid: false, disabled: false },
});

/**
 * The editable content area.
 *
 * <p>Base body text matches the app-wide content size (text-sm, same as inputs and detail
 * fields). Block and mark typography lives on the node components (heading, list, ...), not on
 * this container. `outline-none` with nothing put back: this is the writing surface, where the
 * caret is what says the keyboard is here. A ring around the page would frame the document.
 */
export const plateEditorStyle = defineSlotStyle({
  slot: "plate-editor",
  base: "outline-none text-sm [&_*::selection]:bg-primary/20",
  variants: {
    padding: { default: "p-4", none: "p-0" },
  },
  defaultVariants: { padding: "default" },
});
