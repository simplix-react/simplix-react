import { type VariantProps, cva } from "class-variance-authority";
import { Children, type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { slotAttributes, slotClassNames } from "../design/slot-style";
import { cn } from "../utils/cn";
import { stackEmptyStyle, stackFadeStyle, stackStyle } from "./stack.style";

/** CVA variants for the Stack component's layout: flow, alignment, sizing and overflow. */
const stackLayout = cva("flex", {
  variants: {
    direction: { column: "flex-col", row: "flex-row" },
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
    // `shrink={false}` opts the stack out of flex-shrinking (applies `shrink-0`).
    shrink: { false: "shrink-0" },
    // Overflow behavior for the stack container.
    overflow: {
      visible: "overflow-visible",
      hidden: "overflow-hidden",
      auto: "overflow-auto",
      scroll: "overflow-scroll",
    },
    // Allow shrinking below intrinsic content size - enables truncation/scroll inside flex parents.
    minSize: { true: "min-w-0 min-h-0" },
  },
  defaultVariants: { direction: "column", align: "stretch" },
});

/** The stack's drawn look (gap, padding) as a class-string function. */
const stackLook = slotClassNames(stackStyle);

/** Variant props of the Stack component: its layout axes and its look axes. */
export type StackVariants = VariantProps<typeof stackLayout> & VariantProps<typeof stackLook>;

/** Class string for a stack with the given variants: its layout classes plus its drawn look. */
const stackVariants = (props?: StackVariants): string => cn(stackLayout(props), stackLook(props));

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
export const StackBase = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction,
      gap,
      align,
      justify,
      wrap,
      fill,
      flex,
      padded,
      shrink,
      overflow,
      minSize,
      fade,
      emptyContent,
      children,
      ...rest
    },
    ref,
  ) => {
    const hasChildren = Children.toArray(children).filter(Boolean).length > 0;
    const isEmpty = !hasChildren && emptyContent != null;

    const innerContent = isEmpty ? (
      <div
        className="flex flex-1 items-center justify-center"
        {...slotAttributes(stackEmptyStyle, {})}
      >
        {emptyContent}
      </div>
    ) : children;

    const stackClass = cn(
      stackLayout({
        direction,
        align,
        justify,
        wrap,
        fill: fade ? undefined : fill,
        flex: fade ? undefined : flex,
        shrink,
        // Fade mode clips content via its own overflow-hidden wrapper; defer to it.
        overflow: fade ? undefined : overflow,
        minSize,
      }),
      className,
    );
    const look = slotAttributes(stackStyle, { gap, padded });

    if (!fade) {
      return (
        <div ref={ref} className={stackClass} {...rest} {...look}>
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
        <div className={cn(stackClass, "h-full overflow-hidden")} {...look}>
          {innerContent}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          {...slotAttributes(stackFadeStyle, {})}
        />
      </div>
    );
  },
);
StackBase.displayName = "Stack";

export const Stack = createSelfResolving("Stack", StackBase);

export { stackVariants };
