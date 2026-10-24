import { type VariantProps, cva } from "class-variance-authority";
import { Children, cloneElement, type ComponentPropsWithRef, forwardRef, isValidElement, type ReactNode } from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { isPartAttribute, slotAttributes, slotClassNames } from "../design/slot-style";
import { cn } from "../utils/cn";
import { gridStyle } from "./grid.style";

/** CVA variants for the Grid component's column structure. */
const gridLayout = cva("grid", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    },
  },
  defaultVariants: { columns: 1 },
});

/** The grid's drawn look (gaps) as a class-string function. */
const gridLook = slotClassNames(gridStyle);

/** Class string for a grid with the given variants: its column classes plus its drawn gaps. */
const gridVariants = (props?: GridVariants): string => cn(gridLayout(props), gridLook(props));

/** Variant props extracted from {@link gridVariants}. */
export type GridVariants = VariantProps<typeof gridLayout> & {
  gap?: NonNullable<Parameters<typeof gridLook>[0]>["gap"];
};

/** Props for the {@link Grid} layout component. */
export interface GridProps
  extends ComponentPropsWithRef<"div">,
    GridVariants {
  children?: ReactNode;
  /**
   * When true, columns responsively decrease based on container width
   * using CSS container queries. Requires Tailwind CSS v4+.
   *
   * @default true
   */
  responsive?: boolean;
  /**
   * When true, renders a vertical separator line between columns for visual
   * grouping (e.g. a two-column switch matrix in a form section).
   *
   * Supported for fixed-column grids (`responsive={false}`) and for responsive
   * grids with `columns={2}` (the line hides while the grid is collapsed to a
   * single column). Ignored when `template` is set or for responsive grids with
   * more than two columns, where the active column count varies by breakpoint.
   *
   * @default false
   */
  divider?: boolean;
  /**
   * Column (horizontal) gap override. Takes precedence over `gap` on the x axis,
   * letting a grid combine a wide gutter between columns with tight row spacing
   * (e.g. `gapX="lg" gapY="sm"` for a two-column switch matrix).
   */
  gapX?: GridVariants["gap"];
  /**
   * Row (vertical) gap override. Takes precedence over `gap` on the y axis.
   */
  gapY?: GridVariants["gap"];
  /**
   * Never draw more columns than there are items, and spread what there are evenly over the rows.
   *
   * <p>A fixed column count is a maximum, not a promise: a four-column grid handed two items draws
   * them at a quarter width each and leaves the other half of the row empty, which reads as two
   * tiles that failed to load rather than as a set of two. With this set, two items make two
   * columns, six items in a four-column grid make two rows of three rather than four and two, and
   * seven make four and three — the row that cannot be filled is the only one left short.
   *
   * <p>Off by default, because a grid whose cells are positional (a form laid out two fields to a
   * row) means its column count literally and must not reflow when a field is conditional. Set it
   * on a grid whose children are peers — chips, tiles, cards.
   *
   * @default false
   */
  fit?: boolean;
  /**
   * Arbitrary `grid-template-columns` value applied as an inline style,
   * covering cases the `columns` enum cannot express (e.g. `"repeat(auto-fill, minmax(12rem, 1fr))"`
   * or `"200px 1fr"`). When provided, the `columns` class and responsive
   * container-query behavior are skipped — `template` takes precedence.
   *
   * @example
   * ```tsx
   * <Grid template="repeat(auto-fill, minmax(12rem, 1fr))" gap="sm">
   *   {items}
   * </Grid>
   * ```
   */
  template?: string;
}

/**
 * Container-query responsive column classes.
 * Each column needs ~190px minimum width.
 *
 * Tailwind v4 container breakpoints:
 * - `@sm` = 24rem (384px) → 2 columns (narrow side panels still fit two ~190px fields)
 * - `@2xl` = 42rem (672px) → 3 columns
 * - `@4xl` = 56rem (896px) → 4 columns
 * - `@5xl` = 64rem (1024px) → 5+ columns
 */
const responsiveColumnClasses: Record<number, string> = {
  2: "grid-cols-1 @sm:grid-cols-2",
  3: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3",
  4: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4",
  5: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5",
  6: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-6",
};

/** The class that marks a cell the grid draws a column rule on; see `rule` in `grid.style.ts`. */
const COLUMN_RULE = "grid-column-rule";

/** The horizontal gaps the column rule has an offset for; another value falls back to `md`. */
const RULE_GAPS = new Set(["none", "px", "xs", "sm", "md", "lg", "xl"]);

/**
 * The column count that spreads `items` evenly over as few rows as `max` columns would need.
 *
 * <p>Fewer items than columns collapses to the item count, so nothing is drawn at a fraction of
 * the row it does not use. More items than columns keeps the row count the maximum would have
 * given and then widens the columns until the items fill them: six over four columns is two rows
 * of three, not four and two.
 *
 * @param items how many children the grid has
 * @param max the declared column count, read as a ceiling
 * @returns the column count to draw with
 */
function balancedColumns(items: number, max: number): number {
  if (items < 1) return max;
  if (items <= max) return items;
  return Math.ceil(items / Math.ceil(items / max));
}

/**
 * Draws the column rule on the cells that actually start a new column.
 *
 * <p>A single line down the gutter spans the grid's full height, so it crosses the middle of any
 * cell wide enough to claim the whole row. Bordering the cells instead means the rule appears
 * exactly where two fields sit side by side and stops where one field takes the row. The border
 * sits on the cell's left edge, so the cell is widened by half a gutter and padded back by the
 * same amount, which puts the line mid-gutter without moving the content.
 *
 * <p>The grid marks those cells with {@link COLUMN_RULE} and draws the rule itself (its `rule`
 * axis), so the look stays in the grid's declaration while the cell only says where it sits.
 *
 * @param children the grid's cells
 * @param cols how many columns the grid has
 * @returns the cells, with the marker on those that follow another in their row
 */
function withColumnRules(children: ReactNode, cols: number): ReactNode {
  let filled = 0;
  return Children.map(children, (child) => {
    if (!isValidElement<{ className?: string }>(child)) return child;

    const spansRow = (child.props.className ?? "").includes("col-span-full");
    const span = spansRow ? cols : 1;
    // A cell that cannot fit in what is left of the row starts the next one.
    if (spansRow && filled % cols !== 0) filled += cols - (filled % cols);
    const startsRow = filled % cols === 0;
    filled += span;

    if (startsRow) return child;
    return cloneElement(child, { className: cn(child.props.className, COLUMN_RULE) });
  });
}

/**
 * CSS Grid layout primitive with configurable columns and gap.
 * By default, columns responsively decrease based on container width.
 *
 * ```
 * columns={2}, gap="md"
 * ┌─────────────┬─────────────┐
 * │  [Input A]  │  [Input B]  │
 * ├─────────────┼─────────────┤
 * │  [Input C]  │  [Input D]  │
 * └─────────────┴─────────────┘
 * ```
 *
 * @param props - {@link GridProps}
 *
 * @example
 * ```tsx
 * <Grid columns={2} gap="md">
 *   <TextField label="First Name" value={first} onChange={setFirst} />
 *   <TextField label="Last Name" value={last} onChange={setLast} />
 * </Grid>
 * ```
 */
export const GridBase = forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns, gap, gapX, gapY, responsive = true, divider = false, fit = false, template, children, style, ...rest }, ref) => {
    const declared = columns ?? 1;
    // toArray drops null / undefined / booleans, so a conditional child that rendered nothing
    // does not claim a column.
    const cols = fit ? balancedColumns(Children.toArray(children).length, declared) : declared;
    const isResponsive = responsive && cols > 1;
    const gapKey = (gap ?? "md") as string;
    // Divider lines sit mid-gutter, so their position follows the horizontal gap.
    const dividerGap = (gapX as string | undefined) ?? gapKey;
    // Divider lines assume a stable column count: fixed grids always qualify;
    // responsive grids only in the two-column case (the line hides when collapsed).
    const showDivider = divider && cols > 1 && !template && (!isResponsive || cols === 2);
    const ruleGap = RULE_GAPS.has(dividerGap) ? dividerGap : "md";
    const rule = showDivider ? (isResponsive ? `${ruleGap}-collapsing` : ruleGap) : undefined;
    const look = slotAttributes(gridStyle, { gap: gapKey, gapx: gapX, gapy: gapY, rule });

    // An explicit grid-template-columns string overrides the columns enum and
    // responsive container-query path; apply it as an inline style.
    if (template) {
      return (
        <div
          ref={ref}
          className={cn("grid", className)}
          style={{ gridTemplateColumns: template, ...style }}
          {...rest}
          {...look}
        >
          {children}
        </div>
      );
    }

    if (isResponsive) {
      const colClass = responsiveColumnClasses[cols] ?? `grid-cols-${cols}`;

      // A caller's part attributes mark the element that draws the grid, so they go to the inner
      // grid with its className rather than to the container-query wrapper.
      const outerProps = Object.fromEntries(Object.entries(rest).filter(([key]) => !isPartAttribute(key)));
      const partProps = Object.fromEntries(Object.entries(rest).filter(([key]) => isPartAttribute(key)));
      return (
        <div ref={ref} className="@container" style={style} {...outerProps}>
          <div className={cn("relative grid", colClass, className)} {...partProps} {...look}>
            {showDivider ? withColumnRules(children, cols) : children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(gridLayout({ columns: cols as GridVariants["columns"] }), showDivider && "relative", className)}
        style={style}
        {...rest}
        {...look}
      >
        {showDivider ? withColumnRules(children, cols) : children}
      </div>
    );
  },
);
GridBase.displayName = "Grid";

export const Grid = createSelfResolving("Grid", GridBase);

export { gridVariants };
