import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import { STATUS_TONES, type StatusTone } from "./status-tone";

/** Props for the {@link StatusBadge} component. */
export interface StatusBadgeProps extends ViewProps {
  /** Semantic status tone. */
  tone: StatusTone;
  /** Outline style instead of the filled soft background. */
  outline?: boolean;
  /** Leading indicator dot. */
  dot?: boolean;
  children?: ReactNode;
}

/**
 * Status badge bound to the semantic {@link StatusTone} vocabulary
 * (success / warning / danger / info / neutral / pending / processing).
 *
 * @example
 * ```tsx
 * <StatusBadge tone="success">Approved</StatusBadge>
 * <StatusBadge tone="pending" dot>Awaiting review</StatusBadge>
 * ```
 */
export function StatusBadge({
  className,
  tone,
  outline,
  dot,
  children,
  ...rest
}: StatusBadgeProps) {
  const token = STATUS_TONES[tone];

  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-0.5",
        outline ? cn("border bg-transparent", token.outline) : token.badge,
        className,
      )}
      {...rest}
    >
      {dot ? <View className={cn("h-1.5 w-1.5 rounded-full", token.dot)} /> : null}
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          className={cn(
            "text-xs font-medium",
            outline ? token.outlineText : token.badgeText,
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
