import { defineSlotStyle } from "../../design/slot-style";

/** The combobox panel: a part on the stack that holds the search input and the list. */
export const comboboxPanelStyle = defineSlotStyle({
  slot: "field-combobox-panel",
  as: "part",
  base: "p-2",
  variants: {},
  defaultVariants: {},
});

/** The combobox search input: a part on the input, which carries its own slot. */
export const comboboxSearchStyle = defineSlotStyle({
  slot: "field-combobox-search",
  as: "part",
  base: "mb-2",
  variants: {},
  defaultVariants: {},
});

/** The loading and no-results lines of the option list. */
export const comboboxStatusStyle = defineSlotStyle({
  slot: "field-combobox-status",
  base: "py-4 text-sm text-muted-foreground",
  variants: {
    kind: { loading: "", empty: "text-center" },
  },
  defaultVariants: { kind: "empty" },
});

/** The spinner shown while options load. */
export const comboboxSpinnerStyle = defineSlotStyle({
  slot: "field-combobox-spinner",
  base: "mr-2 animate-spin",
  variants: {},
  defaultVariants: {},
});

/** The faint ring of the spinner. */
export const comboboxSpinnerTrackStyle = defineSlotStyle({
  slot: "field-combobox-spinner-track",
  base: "opacity-25",
  variants: {},
  defaultVariants: {},
});

/** The bright arc of the spinner. */
export const comboboxSpinnerArcStyle = defineSlotStyle({
  slot: "field-combobox-spinner-arc",
  base: "opacity-75",
  variants: {},
  defaultVariants: {},
});

/** One option row of the list. */
export const comboboxOptionStyle = defineSlotStyle({
  slot: "field-combobox-option",
  // `outline-none` with nothing put back: the input keeps focus and the cursor moves by
  // `data-highlighted`, which the accent below paints.
  base: "rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
  variants: {
    // The accent background marks the CURSOR only; the selected option is indicated by the
    // trailing check + weight, so the two states stay distinguishable while arrowing around.
    cursor: { true: "bg-accent text-accent-foreground", false: "" },
    chosen: { true: "font-medium", false: "" },
  },
  defaultVariants: { cursor: false, chosen: false },
});

/** The icon and label of the selected value or of an option. */
export const comboboxLabelStyle = defineSlotStyle({
  slot: "field-combobox-label",
  base: "gap-1.5",
  variants: {
    empty: { true: "text-muted-foreground", false: "" },
  },
  defaultVariants: { empty: false },
});

/** The check after the chosen option. */
export const comboboxCheckStyle = defineSlotStyle({
  slot: "field-combobox-check",
  base: "ml-2",
  variants: {},
  defaultVariants: {},
});
