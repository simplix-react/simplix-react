import { defineSlotStyle } from "../../design/slot-style";

/** The scroll container around a table. */
export const tableContainerStyle = defineSlotStyle({
  slot: "table-container",
  // While the table scrolls sideways the box is a focusable region: its ring is drawn inside its edge
  // (a card around the table clips anything outside it), and the edge with columns past it fades so
  // the hidden columns read as reachable, not missing. The fade is lifted while the box holds keyboard
  // focus, since a mask would fade the ring too.
  base: "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:-outline-offset-2 data-[scroll-edge=end]:not-focus-visible:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] data-[scroll-edge=start]:not-focus-visible:[mask-image:linear-gradient(to_left,black_calc(100%-2rem),transparent)] data-[scroll-edge=both]:not-focus-visible:[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]",
  variants: {
    rounded: { none: "", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" },
    bordered: { true: "border border-border", false: "" },
  },
  defaultVariants: { rounded: "none", bordered: false },
});

/** The table element. */
export const tableStyle = defineSlotStyle({
  slot: "table",
  base: "text-base",
  variants: {
    bordered: { true: "border-separate border-spacing-0", false: "" },
  },
  defaultVariants: { bordered: false },
});

/** The header group. */
export const tableHeaderStyle = defineSlotStyle({
  slot: "table-header",
  base: "bg-muted/40 [&_tr]:border-b [&_tr]:border-border-strong",
  variants: {
    /**
     * A framed card (own scroll region) draws the top edge; thead border-t would double it.
     * Unframed tables keep their own edge.
     */
    framed: { true: "", false: "border-t border-border" },
  },
  defaultVariants: { framed: false },
});

/** The body group. */
export const tableBodyStyle = defineSlotStyle({
  slot: "table-body",
  base: "",
  variants: {
    /**
     * Framed (own scroll region): card bottom / pagination border-t is the closing line, so the
     * last row's border-b would double it.
     */
    framed: { true: "[&>tr:last-child]:border-b-0", false: "" },
  },
  defaultVariants: { framed: false },
});

/** The footer group. */
export const tableFooterStyle = defineSlotStyle({
  slot: "table-footer",
  base: "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
  variants: {},
  defaultVariants: {},
});

/** A table row. */
export const tableRowStyle = defineSlotStyle({
  slot: "table-row",
  base: "border-b border-border transition-colors duration-[var(--dur-fast)]",
  variants: {
    variant: {
      // Hover one step, press one more.
      default: "hover:bg-muted/40 active:bg-muted/70",
      striped: "even:bg-muted/50",
      bordered: "hover:bg-muted/50",
    },
  },
  defaultVariants: { variant: "default" },
});

/** A header cell. */
export const tableHeadStyle = defineSlotStyle({
  slot: "table-head",
  base: "text-left text-xs font-semibold tracking-[0.01em] text-muted-foreground [&:has([role=checkbox])]:pr-0",
  variants: {
    size: { sm: "px-2", md: "px-3", lg: "px-4" },
    bordered: { true: "border border-border", false: "" },
    /**
     * How the header sticks.
     *
     * <p>The th carries its own bg + borders so they travel with the floating cell (thead's
     * borders stay at the layout position). The bg must be opaque (same tone as bg-muted/40 over
     * the page background) so rows do not show through while it floats. `scroll` is the table's
     * own scroll region (framed card): CSS sticky, the card draws the top edge. `floating` is a
     * table without one: the transform in useAncestorStickyHeader moves the thead, which paints
     * above the in-flow rows on its own.
     */
    sticky: {
      none: "",
      scroll: "bg-[color-mix(in_srgb,var(--muted)_40%,var(--background))] border-b border-border",
      floating:
        "bg-[color-mix(in_srgb,var(--muted)_40%,var(--background))] border-b border-border border-t",
    },
  },
  defaultVariants: { size: "md", bordered: false, sticky: "none" },
});

/** A data cell. */
export const tableCellStyle = defineSlotStyle({
  slot: "table-cell",
  // Data cells default to text-sm (the header row is text-xs); keeps record typography
  // consistent so bare cells don't inherit the table root's text-base.
  base: "text-sm [&:has([role=checkbox])]:pr-0",
  variants: {
    size: {
      sm: "px-2 py-1.5",
      md: "px-3 py-2.5",
      lg: "px-4 py-4",
    },
    // Set only when the table declares a density; it replaces the size's vertical padding.
    density: {
      compact: "py-1.5",
      default: "py-2.5",
      comfortable: "py-3",
    },
    bordered: { true: "border border-border", false: "" },
  },
  defaultVariants: { size: "md", bordered: false },
});

/** The table caption. */
export const tableCaptionStyle = defineSlotStyle({
  slot: "table-caption",
  base: "mt-4 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
