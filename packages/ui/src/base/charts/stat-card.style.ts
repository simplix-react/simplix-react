import { defineSlotStyle } from "../../design/slot-style";

/** The stat card's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const statCardStyle = defineSlotStyle({
  slot: "stat-card",
  // Card's `sm` step, not its `md`. A figure tile is a card and must not sit taller than the
  // cards beside it; four of them across the top of a list screen is the first thing between
  // the header and the rows, and every row of padding there is a row of the list pushed off
  // the fold. The sides keep the full step - that is the gutter between the border and the
  // first character, and narrowing it makes the text look pressed against the edge.
  // Full height of whatever row it is in, because that is what every caller wants and each
  // one was writing `className="h-full"` to get it - the shared tile row of one product
  // included. A row of four with one two-line basis otherwise draws three cards floating
  // above a taller neighbour. In a parent that does not stretch, `h-full` resolves to auto
  // and nothing changes, so this costs a lone tile nothing.
  // A figure tile: the title, the figure and its foot down a 124px card that lifts when pointed at.
  base: "h-full rounded-lg border px-4 text-card-foreground shadow-sm flex min-h-31 flex-col gap-1 py-3.5 transition-[box-shadow,border-color,translate,scale] duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98]",
  variants: {
    /** A tinted card takes its surface from the status tone the caller passes as a class. */
    tinted: { true: "", false: "bg-card" },
  },
  defaultVariants: { tinted: false },
});

/** The row holding the card title, its extra content and its icon. */
export const statCardHeaderStyle = defineSlotStyle({
  slot: "stat-card-header",
  base: "min-h-[22px] gap-2",
  variants: {},
  defaultVariants: {},
});

/** What the figure is called. */
export const statCardTitleStyle = defineSlotStyle({
  slot: "stat-card-title",
  base: "text-sm font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The trailing icon of the header. */
export const statCardIconStyle = defineSlotStyle({
  slot: "stat-card-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The row holding the figure and the optional plot beside it. */
export const statCardBodyStyle = defineSlotStyle({
  slot: "stat-card-body",
  base: "gap-3 mt-1.5",
  variants: {},
  defaultVariants: {},
});

/** The primary figure. */
export const statCardValueStyle = defineSlotStyle({
  slot: "stat-card-value",
  base: "text-2xl font-bold leading-none",
  variants: {
    /** The card's status tone, so a design can colour the figure instead of tinting the card. */
    tone: {
      none: "",
      success: "",
      warning: "",
      danger: "",
      info: "",
      neutral: "",
      pending: "",
      processing: "",
    },
  },
  defaultVariants: { tone: "none" },
});

/** What stands in for the figure while it is being read. */
export const statCardSkeletonStyle = defineSlotStyle({
  slot: "stat-card-skeleton",
  base: "h-6 w-14 rounded bg-muted bg-[linear-gradient(90deg,var(--muted),var(--shimmer),var(--muted))] bg-[length:200%_100%] animate-skeleton-shine motion-reduce:animate-none",
  variants: {},
  defaultVariants: {},
});

/** The unit beside the figure; classic draws it in the figure's own type. */
export const statCardUnitStyle = defineSlotStyle({
  slot: "stat-card-unit",
  // The unit stands apart from the figure, quieter, and is one word: the figure above it wraps
  // anywhere, so without `whitespace-nowrap` a narrow card breaks inside the unit.
  base: "ms-1 whitespace-nowrap font-sans font-medium tracking-normal text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The row holding the description and the trend. */
export const statCardFooterStyle = defineSlotStyle({
  slot: "stat-card-footer",
  base: "mt-auto pt-2 gap-x-2.5",
  variants: {},
  defaultVariants: {},
});

/** What the figure was read from. */
export const statCardDescriptionStyle = defineSlotStyle({
  slot: "stat-card-description",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The trend indicator; its colour comes from the status tone as a class. */
export const statCardTrendStyle = defineSlotStyle({
  slot: "stat-card-trend",
  base: "text-xs font-medium",
  variants: {},
  defaultVariants: {},
});
