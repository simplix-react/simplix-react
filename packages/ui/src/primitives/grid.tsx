import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef, type ReactNode, useContext } from "react";

import { UIComponentContext } from "../provider/ui-component-context";
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
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

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
const GridBase = forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns, gap, responsive = true, children, ...rest }, ref) => {
    const cols = columns ?? 1;
    const isResponsive = responsive && cols > 1;

    if (isResponsive) {
      const colClass = responsiveColumnClasses[cols] ?? `grid-cols-${cols}`;
      const gapClass = gapClassMap[(gap ?? "md") as string] ?? "gap-4";

      return (
        <div ref={ref} className="@container" {...rest}>
          <div className={cn("grid", colClass, gapClass, className)}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(gridVariants({ columns, gap }), className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
GridBase.displayName = "Grid";

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Grid) {
      return <ctx.Grid {...props} />;
    }
    return <GridBase ref={ref} {...props} />;
  },
);
Grid.displayName = "Grid";

export { gridVariants };
