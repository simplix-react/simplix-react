import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import { STATUS_TONES, type StatusTone } from "./status-tone";

/** Props for the {@link AlertBanner} component. */
export interface AlertBannerProps extends ViewProps {
  /** Semantic status tone. Defaults to `"info"`. */
  tone?: StatusTone;
  /** Bold first line of the banner. */
  title?: string;
  /** Body content — strings render in the tone's surface text style. */
  children?: ReactNode;
  /** Trailing content (e.g. an action button). */
  action?: ReactNode;
}

/**
 * Inline alert banner on a soft tone surface with a leading indicator bar.
 *
 * @example
 * ```tsx
 * <AlertBanner tone="warning" title="Network unstable">
 *   Changes will sync when the connection recovers.
 * </AlertBanner>
 * ```
 */
export function AlertBanner({
  className,
  tone = "info",
  title,
  children,
  action,
  ...rest
}: AlertBannerProps) {
  const token = STATUS_TONES[tone];

  return (
    <View
      accessibilityRole="alert"
      className={cn(
        "flex-row items-start gap-3 rounded-md border p-3",
        token.surface,
        className,
      )}
      {...rest}
    >
      <View className={cn("mt-0.5 h-full w-1 self-stretch rounded-full", token.dot)} />
      <View className="flex-1 gap-0.5">
        {title ? (
          <Text size="sm" className={cn("font-semibold", token.surfaceText)}>
            {title}
          </Text>
        ) : null}
        {typeof children === "string" ? (
          <Text size="sm" className={token.surfaceText}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
      {action}
    </View>
  );
}
