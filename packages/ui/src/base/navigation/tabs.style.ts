import { defineSlotStyle } from "../../design/slot-style";

/** The strip that holds the triggers. */
export const tabsListStyle = defineSlotStyle({
  slot: "tabs-list",
  base: "",
  variants: {
    variant: {
      // Vertical padding is half the horizontal one so the 28px trigger fits inside the 34px
      // content box of an h-9 bordered track. With `p-1` the trigger overflows the box by 2px,
      // invisible on its own, but a list wrapped in `overflow-x-auto` has its overflow-y
      // computed to `auto` as well, and that 1px of bottom overflow paints a scrollbar.
      // `items-center` keeps the trigger exactly where `p-1` rendered it.
      default: "rounded-lg border border-input bg-card px-1 py-0.5 text-muted-foreground",
      // The page's own tab strip: tabs standing on a hairline from the start, the chosen one marked
      // by the ink that slides under it.
      full: "mt-0 h-auto justify-start gap-0.5 p-0 text-muted-foreground shadow-[inset_0_-1px_0_0_var(--border)] [&>[role=tab]]:flex-none",
      // Bottom-baseline track for the `bookmark` list variant. The line is an inset shadow (not a
      // border) so the active tab's `bg-card` covers it without relying on overflow - the cutout
      // survives `overflow-x-auto` horizontal scroll.
      bookmark: "gap-0 px-2 shadow-[inset_0_-2px_0_0_var(--border)]",
      // Bottom baseline for the `underline` list variant.
      //
      // A hairline rather than the 2px `bookmark` sits on: these tabs are a second level inside a
      // surface that already has tabs above it, and the thing that has to read as quieter is the
      // line as much as the triggers. Full width so the baseline runs the width of the panel and
      // the tabs sit on it from the start, which is where a reader looks for a second level.
      underline: "mt-2 gap-1 shadow-[inset_0_-1px_0_0_var(--border)]",
    },
  },
  defaultVariants: { variant: "default" },
});

/**
 * The rule under the chosen tab, placed by `--x` and `--w`. The page strip draws it and slides it
 * to the new tab; the other variants mark the tab itself.
 */
export const tabsInkStyle = defineSlotStyle({
  slot: "tabs-ink",
  base: "hidden",
  variants: {
    variant: {
      default: "",
      full: "block h-0.5 w-[var(--w)] translate-x-[var(--x)] bg-primary transition-[translate,width] duration-[var(--dur-slow)] ease-[var(--ease)]",
      bookmark: "",
      underline: "",
    },
  },
  defaultVariants: { variant: "default" },
});

/** One tab trigger; it takes the variant of the list it sits in. */
export const tabsTriggerStyle = defineSlotStyle({
  slot: "tabs-trigger",
  base: "text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50 focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    variant: {
      default:
        "rounded-md px-3 py-1 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:text-primary-foreground",
      full: "h-10 gap-[7px] rounded-none px-3 py-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground data-[state=active]:text-foreground data-[state=active]:hover:text-foreground",
      bookmark:
        "gap-2 rounded-t-lg border border-transparent border-b-0 px-4 py-2.5 font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:-mb-px data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold data-[state=active]:text-foreground",
      // The rule is drawn as a border on the trigger itself and it is transparent when the tab is
      // not chosen, so the label never moves as the choice changes - a rule added on the active
      // state alone shifts every label up by its own width the moment it appears.
      underline:
        "-mb-px gap-2 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

/** The panel of the chosen tab. */
export const tabsContentStyle = defineSlotStyle({
  slot: "tabs-content",
  // `outline-none` on the panel, and only on the panel. Radix moves focus here when a tab is
  // chosen so the next Tab lands inside; it is a region rather than a control, and the first
  // control in it rings normally.
  // A tab panel takes focus from the keyboard; it shows the shared halo.
  base: "outline-none duration-[var(--dur-base)] ease-[var(--ease)] focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    /**
     * Insets the panel from the strip above it and from whatever follows.
     *
     * <p><b>The same step top and bottom.</b> It was `pt-4 pb-8`, and the extra step at the
     * bottom is the floor a list-detail page grows when its detail opens: the list column
     * carries no padding of its own, so while the list runs past the panel the bottom step is
     * never seen, and the moment the panel clips everything to one box it appears as a margin
     * that belongs to nothing. A reader resizing the window watches it change, because the
     * leftover height changes and the step does not.
     */
    padded: { true: "py-4", false: "" },
  },
  defaultVariants: { padded: false },
});
