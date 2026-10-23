import { defineSlotStyle } from "../../design/slot-style";

/** The color picker trigger swatch. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const colorPickerTriggerStyle = defineSlotStyle({
  slot: "color-picker-trigger",
  base: "rounded-md border-2 p-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
  variants: {
    empty: { true: "border-dashed", false: "" },
  },
  defaultVariants: { empty: false },
});

/** The plus glyph shown while no color is picked. */
export const colorPickerPlaceholderStyle = defineSlotStyle({
  slot: "color-picker-placeholder",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The popover body stacking the palette and the footer. */
export const colorPickerBodyStyle = defineSlotStyle({
  slot: "color-picker-body",
  base: "space-y-3",
  variants: {},
  defaultVariants: {},
});

/** The preset palette grid. */
export const colorPickerPaletteStyle = defineSlotStyle({
  slot: "color-picker-palette",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** One preset color swatch; the check glyph of the picked one sits inside it. */
export const colorPickerSwatchStyle = defineSlotStyle({
  slot: "color-picker-swatch",
  base: "rounded-md border-2 transition-all hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  variants: {
    selected: {
      true: "border-foreground scale-110 [&>svg]:text-white [&>svg]:drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] [&>svg]:mx-auto",
      false: "border-transparent hover:border-muted-foreground/50",
    },
  },
  defaultVariants: { selected: false },
});

/** The row holding the custom picker and the clear button. */
export const colorPickerFooterStyle = defineSlotStyle({
  slot: "color-picker-footer",
  base: "border-t pt-2",
  variants: {},
  defaultVariants: {},
});

/** The native color input with its caption. */
export const colorPickerCustomStyle = defineSlotStyle({
  slot: "color-picker-custom",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** The native color input. */
export const colorPickerInputStyle = defineSlotStyle({
  slot: "color-picker-input",
  base: "rounded border-0 p-0",
  variants: {},
  defaultVariants: {},
});

/** The caption beside the native color input. */
export const colorPickerCustomLabelStyle = defineSlotStyle({
  slot: "color-picker-custom-label",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The built-in clear button. */
export const colorPickerClearStyle = defineSlotStyle({
  slot: "color-picker-clear",
  base: "rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground [&>svg]:mr-1",
  variants: {},
  defaultVariants: {},
});

/** The color picker's popover panel: a part on the popover content, which carries its own slot. */
export const colorPickerPopoverStyle = defineSlotStyle({
  slot: "color-picker-popover",
  as: "part",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});
