import { defineSlotStyle } from "../../../design/slot-style";

/** A floating link toolbar. */
export const plateLinkToolbarStyle = defineSlotStyle({
  slot: "plate-link-toolbar",
  base: "gap-2 rounded-md border bg-popover p-2 shadow-md",
  variants: {},
  defaultVariants: {},
});

/** The glyph of a toolbar button. */
export const plateLinkToolbarIconStyle = defineSlotStyle({
  slot: "plate-link-toolbar-icon",
  base: "mr-1",
  variants: {},
  defaultVariants: {},
});

/** The anchor that opens the link. */
export const plateLinkToolbarOpenStyle = defineSlotStyle({
  slot: "plate-link-toolbar-open",
  base: "rounded px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
  variants: {
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { disabled: false },
});

/** The link field: a part on the input, which carries its own slot. */
export const plateLinkInputStyle = defineSlotStyle({
  slot: "plate-link-input",
  as: "part",
  base: "text-sm",
  variants: {},
  defaultVariants: {},
});

/** The unlink button: a part on the button, which carries its own slot. */
export const plateLinkUnlinkStyle = defineSlotStyle({
  slot: "plate-link-unlink",
  as: "part",
  base: "text-destructive hover:text-destructive",
  variants: {},
  defaultVariants: {},
});
