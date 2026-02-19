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
}

/**
 * CSS Grid layout primitive with configurable columns and gap.
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
  ({ className, columns, gap, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(gridVariants({ columns, gap }), className)}
      {...rest}
    >
      {children}
    </div>
  ),
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
