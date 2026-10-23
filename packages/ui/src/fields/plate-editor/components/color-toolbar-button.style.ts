import { defineSlotStyle } from "../../../design/slot-style";

/** The bar under the icon that shows the current colour. */
export const plateColorIndicatorStyle = defineSlotStyle({
  slot: "plate-color-indicator",
  base: "rounded-full",
  variants: {},
  defaultVariants: {},
});

/** The grid of colour swatches. */
export const plateColorPaletteStyle = defineSlotStyle({
  slot: "plate-color-palette",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** One colour swatch. */
export const plateColorSwatchStyle = defineSlotStyle({
  slot: "plate-color-swatch",
  base: "rounded border border-border transition-transform hover:scale-110",
  variants: {
    selected: { true: "ring-2 ring-primary ring-offset-1", false: "" },
    transparent: {
      true: "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]",
      false: "",
    },
  },
  defaultVariants: { selected: false, transparent: false },
});

/** The custom colour row. */
export const plateColorCustomStyle = defineSlotStyle({
  slot: "plate-color-custom",
  base: "mt-2 gap-1 border-t border-border pt-2",
  variants: {},
  defaultVariants: {},
});

/** The native colour input. */
export const plateColorPickerStyle = defineSlotStyle({
  slot: "plate-color-picker",
  base: "rounded border-0 p-0",
  variants: {},
  defaultVariants: {},
});

/** The clear colour button. */
export const plateColorClearStyle = defineSlotStyle({
  slot: "plate-color-clear",
  base: "mt-2 rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent",
  variants: {},
  defaultVariants: {},
});

/** The colour popover: a part on the popover content, which carries its own slot. */
export const plateColorPopoverStyle = defineSlotStyle({
  slot: "plate-color-popover",
  as: "part",
  base: "p-2",
  variants: {},
  defaultVariants: {},
});

/** The hex field: a part on the input, which carries its own slot. */
export const plateColorInputStyle = defineSlotStyle({
  slot: "plate-color-input",
  as: "part",
  base: "px-1 text-[10px]",
  variants: {},
  defaultVariants: {},
});
