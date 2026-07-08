import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { cn } from "../utils/cn";

/** CVA variants for the Grid component column and gap configuration. */
const gridVariants = cva("grid", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    },
    gap: {
      none: "gap-0",
      px: "gap-px",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: { columns: 1, gap: "md" },
});

/** Variant props extracted from {@link gridVariants}. */
export type GridVariants = VariantProps<typeof gridVariants>;

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
 * Each column needs ~200px minimum width.
 *
 * Tailwind v4 container breakpoints:
 * - `@md` = 28rem (448px) → 2 columns
 * - `@2xl` = 42rem (672px) → 3 columns
 * - `@4xl` = 56rem (896px) → 4 columns
 * - `@5xl` = 64rem (1024px) → 5+ columns
 */
const responsiveColumnClasses: Record<number, string> = {
  2: "grid-cols-1 @md:grid-cols-2",
  3: "grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3",
  4: "grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4",
  5: "grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5",
  6: "grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-6",
};

const gapClassMap: Record<string, string> = {
  none: "gap-0",
  px: "gap-px",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const gapXClassMap: Record<string, string> = {
  none: "gap-x-0",
  px: "gap-x-px",
  xs: "gap-x-1",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
};

const gapYClassMap: Record<string, string> = {
  none: "gap-y-0",
  px: "gap-y-px",
  xs: "gap-y-1",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
};

/** Resolve the combined gap classes honoring per-axis overrides. */
function resolveGapClasses(gap: string, gapX?: string | null, gapY?: string | null): string {
  return cn(
    gapClassMap[gap] ?? "gap-4",
    gapX ? gapXClassMap[gapX] : undefined,
    gapY ? gapYClassMap[gapY] : undefined,
  );
}

/** Gap sizes as CSS lengths, used to position column divider lines. */
const gapSizeMap: Record<string, string> = {
  none: "0rem",
  px: "1px",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
};

/**
 * Vertical separator lines rendered between grid columns.
 * With N equal columns and gap G, the center of the gutter after column i sits
 * at `i * (100% + G) / N - G / 2`, so each line lands exactly mid-gutter.
 */
function ColumnDividers({ cols, gap, hiddenWhenCollapsed }: { cols: number; gap: string; hiddenWhenCollapsed?: boolean }) {
  const g = gapSizeMap[gap] ?? "1rem";
  return (
    <>
      {Array.from({ length: cols - 1 }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-border",
            hiddenWhenCollapsed && "hidden @md:block",
          )}
          style={{ left: `calc(${i + 1} * (100% + ${g}) / ${cols} - ${g} / 2)` }}
        />
      ))}
    </>
  );
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
  ({ className, columns, gap, gapX, gapY, responsive = true, divider = false, template, children, style, ...rest }, ref) => {
    const cols = columns ?? 1;
    const isResponsive = responsive && cols > 1;
    const gapKey = (gap ?? "md") as string;
    // Divider lines sit mid-gutter, so their position follows the horizontal gap.
    const dividerGap = (gapX as string | undefined) ?? gapKey;
    const gapClasses = resolveGapClasses(gapKey, gapX as string | undefined, gapY as string | undefined);
    // Divider lines assume a stable column count: fixed grids always qualify;
    // responsive grids only in the two-column case (the line hides when collapsed).
    const showDivider = divider && cols > 1 && !template && (!isResponsive || cols === 2);

    // An explicit grid-template-columns string overrides the columns enum and
    // responsive container-query path; apply it as an inline style.
    if (template) {
      return (
        <div
          ref={ref}
          className={cn("grid", gapClasses, className)}
          style={{ gridTemplateColumns: template, ...style }}
          {...rest}
        >
          {children}
        </div>
      );
    }

    if (isResponsive) {
      const colClass = responsiveColumnClasses[cols] ?? `grid-cols-${cols}`;

      return (
        <div ref={ref} className="@container" style={style} {...rest}>
          <div className={cn("relative grid", colClass, gapClasses, className)}>
            {children}
            {showDivider && <ColumnDividers cols={cols} gap={dividerGap} hiddenWhenCollapsed />}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(gridVariants({ columns }), gapClasses, showDivider && "relative", className)}
        style={style}
        {...rest}
      >
        {children}
        {showDivider && <ColumnDividers cols={cols} gap={dividerGap} />}
      </div>
    );
  },
);
GridBase.displayName = "Grid";

export const Grid = createSelfResolving("Grid", GridBase);

export { gridVariants };
