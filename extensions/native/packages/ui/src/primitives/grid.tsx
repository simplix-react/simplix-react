import { Children, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "../utils/cn";

/** Gap scale in density-independent pixels (mirrors the web rem scale). */
const GAP_PX: Record<string, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;

/** Props for the {@link Grid} layout component. */
export interface GridProps extends ViewProps {
  /** Number of equal-width columns. Defaults to `1`. */
  columns?: GridColumns;
  /** Gap between cells. Defaults to `"md"`. */
  gap?: GridGap;
  /** Column (horizontal) gap override. */
  gapX?: GridGap;
  /** Row (vertical) gap override. */
  gapY?: GridGap;
  children?: ReactNode;
}

/**
 * Equal-column grid layout primitive — the same prop language as the web
 * `Grid`, implemented with flex wrapping (React Native has no CSS grid).
 *
 * @example
 * ```tsx
 * <Grid columns={2} gap="md">
 *   <FormFields.TextField label="First Name" value={first} onChange={setFirst} />
 *   <FormFields.TextField label="Last Name" value={last} onChange={setLast} />
 * </Grid>
 * ```
 */
export function Grid({
  className,
  columns = 1,
  gap = "md",
  gapX,
  gapY,
  style,
  children,
  ...rest
}: GridProps) {
  const columnGap = GAP_PX[gapX ?? gap] ?? 16;
  const rowGap = GAP_PX[gapY ?? gap] ?? 16;

  const items = Children.toArray(children).filter(Boolean);

  return (
    <View
      className={cn("flex-row flex-wrap", className)}
      style={[{ marginHorizontal: -columnGap / 2, rowGap }, style]}
      {...rest}
    >
      {items.map((child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: columnGap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
