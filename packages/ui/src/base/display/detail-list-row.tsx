import {
  type KeyboardEvent,
  forwardRef,
  type ReactNode,
} from "react";

import { Flex } from "../../primitives";
import { Stack } from "../../primitives";
import { Text } from "../../primitives";
import { cn } from "../../utils/cn";

/** Props for the {@link DetailListRow} component. */
export interface DetailListRowProps {
  /** Leading slot rendered before the primary content (icon or status dot). */
  icon?: ReactNode;
  /** Primary content rendered as medium-weight, truncating body text. */
  primary: ReactNode;
  /** Trailing slot rendered at the row end (badge, secondary text, flow node). */
  trailing?: ReactNode;
  /**
   * When set, the row becomes an interactive button: it gains button
   * semantics, keyboard activation (Enter / Space), and a hover affordance.
   */
  onClick?: () => void;
  /** Additional classes merged onto the row root. */
  className?: string;
}

/**
 * A single fixed-height row inside a {@link DetailList}. Renders an optional
 * leading icon, a truncating primary label, and an optional trailing slot.
 *
 * When `onClick` is supplied the row upgrades to button semantics with
 * keyboard activation and a hover background, so it stays accessible as an
 * actionable list item.
 *
 * ```
 * ┌────────────────────────────────────────────┐
 * │ [icon]  Primary label (truncates)  [trailing]│
 * └────────────────────────────────────────────┘
 * ```
 *
 * @example
 * ```tsx
 * <DetailList>
 *   <DetailListRow icon={<Icon />} primary="Status" trailing={<Badge>Active</Badge>} />
 *   <DetailListRow primary="Region" trailing="us-east-1" onClick={openRegion} />
 * </DetailList>
 * ```
 */
export const DetailListRow = forwardRef<HTMLDivElement, DetailListRowProps>(
  ({ icon, primary, trailing, onClick, className }, ref) => {
    const interactive = onClick != null;

    // Activate on Enter / Space to match native button keyboard behavior.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.();
      }
    };

    return (
      <Flex
        ref={ref}
        align="center"
        gap="md"
        className={cn(
          "h-10 border-b px-4 last:border-b-0",
          interactive &&
            "cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? onClick : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
      >
        {icon}
        <Text as="div" size="sm" className="font-medium flex-1 truncate">
          {primary}
        </Text>
        {trailing}
      </Flex>
    );
  },
);

DetailListRow.displayName = "DetailListRow";

/** Props for the {@link DetailList} container. */
export interface DetailListProps {
  /** {@link DetailListRow} elements composing the bordered group. */
  children: ReactNode;
  /**
   * Docked under the last row, inside the same border and above the clip.
   *
   * <p>For whatever the group owes below its rows — a pager, a total, a 「show all」 link.
   * Rendered only when supplied, and separated by its own top border so it reads as the group's
   * footer rather than as one more row. `CrudDetail.List` fills it with the list's own pager,
   * which is what a sub-list inside a detail panel should carry: the alternative each screen
   * reaches for otherwise is a caption saying 「and N more」, and six screens produce six of them.
   */
  footer?: ReactNode;
  /** Additional classes merged onto the container root. */
  className?: string;
}

/**
 * Bordered, rounded container that groups {@link DetailListRow} items. The
 * `overflow-hidden` clip lets each row's bottom border (and the
 * `last:border-b-0` on the final row) render as a clean, seamless divider set.
 *
 * @example
 * ```tsx
 * <DetailList>
 *   <DetailListRow primary="Name" trailing="acme-prod" />
 *   <DetailListRow primary="Owner" trailing="ops-team" />
 * </DetailList>
 * ```
 */
export const DetailList = forwardRef<HTMLDivElement, DetailListProps>(
  ({ children, footer, className }, ref) => (
    <Stack
      ref={ref}
      gap="none"
      className={cn("overflow-hidden rounded-lg border", className)}
    >
      {children}
      {footer != null && <div className="border-t">{footer}</div>}
    </Stack>
  ),
);

DetailList.displayName = "DetailList";
