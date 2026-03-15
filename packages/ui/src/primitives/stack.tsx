import { type VariantProps, cva } from "class-variance-authority";
import { Children, type ComponentPropsWithRef, forwardRef, type ReactNode, useContext } from "react";

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
    fill: { true: "h-full" },
    flex: { true: "flex-1 min-h-0" },
    padded: { true: "pt-4 pb-8" },
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
  /** Show bottom gradient fade overlay. Wraps content in a clipped container with a gradient from card background. */
  fade?: boolean;
  /** Placeholder rendered centered when children are empty. Only shown when no valid children exist. */
  emptyContent?: ReactNode;
}

/**
 * Flexbox layout primitive that stacks children vertically (default) or horizontally.
 *
 * ```
 * direction="column" (default)    direction="row"
 * ┌──────────────┐                ┌────┬────┬────┐
 * │   Child A    │                │ A  │ B  │ C  │
 * ├──────────────┤  gap           └────┴────┴────┘
 * │   Child B    │                  gap   gap
 * ├──────────────┤
 * │   Child C    │
 * └──────────────┘
 * ```
 *
 * @param props - {@link StackProps}
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
    { className, direction, gap, align, justify, wrap, fill, flex, padded, fade, emptyContent, children, ...rest },
    ref,
  ) => {
    const hasChildren = Children.toArray(children).filter(Boolean).length > 0;
    const isEmpty = !hasChildren && emptyContent != null;

    const innerContent = isEmpty ? (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        {emptyContent}
      </div>
    ) : children;

    const stackClass = cn(
      stackVariants({ direction, gap, align, justify, wrap, fill: fade ? undefined : fill, flex: fade ? undefined : flex, padded }),
      className,
    );

    if (!fade) {
      return (
        <div ref={ref} className={stackClass} {...rest}>
          {innerContent}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("relative", fill && "h-full", flex && "flex-1 min-h-0")}
        {...rest}
      >
        <div className={cn(stackClass, "h-full overflow-hidden")}>
          {innerContent}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>
    );
  },
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
