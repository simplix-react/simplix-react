import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "../utils/cn";

/** Max widths in density-independent pixels. */
const SIZE_MAX_WIDTH: Record<string, number | undefined> = {
  "2xl": 672,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  full: undefined,
};

export type ContainerSize = "2xl" | "sm" | "md" | "lg" | "xl" | "full";

/** Props for the {@link Container} layout component. */
export interface ContainerProps extends ViewProps {
  /** Max-width preset. Defaults to `"lg"`. Mostly relevant on tablets. */
  size?: ContainerSize;
  children?: ReactNode;
}

/**
 * Centered, max-width container with horizontal padding — the same prop
 * language as the web `Container`. On phones the max width rarely engages;
 * on tablets it keeps content measured.
 */
export function Container({ className, size = "lg", style, children, ...rest }: ContainerProps) {
  const maxWidth = SIZE_MAX_WIDTH[size];
  return (
    <View
      className={cn("w-full self-center px-4", className)}
      style={[maxWidth !== undefined ? { maxWidth } : undefined, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
