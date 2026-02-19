import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef, type ReactNode, useContext } from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { cn } from "../utils/cn";

/** CVA variants for the Stack component layout configuration. */
const stackVariants = cva("flex", {
  variants: {
    direction: { column: "flex-col", row: "flex-row" },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
    wrap: { true: "flex-wrap", false: "flex-nowrap" },
  },
  defaultVariants: { direction: "column", gap: "md", align: "stretch" },
});

/** Variant props extracted from {@link stackVariants}. */
export type StackVariants = VariantProps<typeof stackVariants>;

/** Props for the {@link Stack} layout component. */
export interface StackProps
  extends Omit<ComponentPropsWithRef<"div">, "dir">,
    StackVariants {
  children?: ReactNode;
}

/**
 * Flexbox layout primitive that stacks children vertically (default) or horizontally.
 *
 * @example
 * ```tsx
 * <Stack gap="lg" align="center">
 *   <p>First</p>
 *   <p>Second</p>
 * </Stack>
 * ```
 */
const StackBase = forwardRef<HTMLDivElement, StackProps>(
  (
    { className, direction, gap, align, justify, wrap, children, ...rest },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        stackVariants({ direction, gap, align, justify, wrap }),
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);
StackBase.displayName = "Stack";

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Stack) {
      return <ctx.Stack {...props} />;
    }
    return <StackBase ref={ref} {...props} />;
  },
);
Stack.displayName = "Stack";

export { stackVariants };
