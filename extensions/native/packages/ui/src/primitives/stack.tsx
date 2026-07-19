import { type VariantProps, cva } from "class-variance-authority";
import { Children, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "../utils/cn";
import { Text } from "./text";

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
    flex: { true: "flex-1" },
    padded: { true: "pt-4 pb-8" },
    // `shrink={false}` opts the stack out of flex-shrinking (applies `shrink-0`).
    shrink: { false: "shrink-0" },
    // React Native supports visible/hidden only; scroll containers are ScrollView.
    overflow: {
      visible: "overflow-visible",
      hidden: "overflow-hidden",
    },
  },
  defaultVariants: { direction: "column", gap: "md", align: "stretch" },
});

/** Variant props extracted from {@link stackVariants}. */
export type StackVariants = VariantProps<typeof stackVariants>;

/** Props for the {@link Stack} layout component. */
export interface StackProps extends ViewProps, StackVariants {
  children?: ReactNode;
  /** Placeholder rendered centered when children are empty. */
  emptyContent?: ReactNode;
}

/**
 * Flexbox layout primitive that stacks children vertically (default) or
 * horizontally — the same prop language as the web `Stack`.
 *
 * @example
 * ```tsx
 * <Stack gap="lg" align="center">
 *   <Text>First</Text>
 *   <Text>Second</Text>
 * </Stack>
 * ```
 */
export function Stack({
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
  emptyContent,
  children,
  ...rest
}: StackProps) {
  const hasChildren = Children.toArray(children).filter(Boolean).length > 0;
  const isEmpty = !hasChildren && emptyContent != null;

  const innerContent = isEmpty ? (
    <View className="flex-1 items-center justify-center">
      {typeof emptyContent === "string" ? (
        <Text size="sm" tone="muted">
          {emptyContent}
        </Text>
      ) : (
        emptyContent
      )}
    </View>
  ) : (
    children
  );

  return (
    <View
      className={cn(
        stackVariants({
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
        }),
        className,
      )}
      {...rest}
    >
      {innerContent}
    </View>
  );
}

export { stackVariants };
