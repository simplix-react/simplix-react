import type { ReactNode } from "react";

import { Grid } from "../../primitives/grid";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";

// ── CardList — Mobile-friendly card-based layout (Phase 3 skeleton) ──

/** Props for the {@link CardList} component. */
export interface CardListProps<T> {
  /** Array of items to render as cards. */
  data: T[];
  /** Render function for each card. */
  renderCard: (item: T, index: number) => ReactNode;
  /** Number of grid columns. Defaults to `1`. */
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * Mobile-friendly card-based list layout alternative to the table view.
 *
 * ```
 * columns={2}
 * ┌───────────────┬───────────────┐
 * │   Card A      │   Card B      │
 * ├───────────────┼───────────────┤
 * │   Card C      │   Card D      │
 * └───────────────┴───────────────┘
 * ```
 *
 * @typeParam T - Row data type.
 * @param props - {@link CardListProps}
 *
 * @example
 * ```tsx
 * <CardList data={items} columns={2} renderCard={(item) => <MyCard item={item} />} />
 * ```
 */
export function CardList<T>({
  data,
  renderCard,
  columns = 1,
  className,
}: CardListProps<T>) {
  if (data.length === 0) {
    return (
      <Stack align="center" justify="center" className={cn("py-12", className)}>
        <p className="text-sm text-muted-foreground">No items to display.</p>
      </Stack>
    );
  }

  return (
    <Grid columns={columns} gap="md" className={className}>
      {data.map((item, index) => renderCard(item, index))}
    </Grid>
  );
}
