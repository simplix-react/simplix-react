import type { ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Default minimum window width for the two-pane layout. */
export const MASTER_DETAIL_BREAKPOINT = 900;

/** Whether the window is wide enough for the two-pane layout. */
export function useIsWideLayout(breakpoint: number = MASTER_DETAIL_BREAKPOINT): boolean {
  const { width } = useWindowDimensions();
  return width >= breakpoint;
}

/** Props for the {@link MasterDetail} component. */
export interface MasterDetailProps {
  /** List pane content. */
  master: ReactNode;
  /** Detail pane content; `null` renders the placeholder. */
  detail?: ReactNode | null;
  /** Placeholder shown in the detail pane when nothing is selected. */
  placeholder?: ReactNode;
  /** Fixed master pane width in the wide layout. Defaults to `360`. */
  masterWidth?: number;
  /** Minimum window width for the two-pane layout. Defaults to `900`. */
  breakpoint?: number;
  className?: string;
}

/**
 * Tablet-landscape two-pane layout. Below the breakpoint only the master
 * pane renders — screens push the detail as a full-screen route instead
 * (check with {@link useIsWideLayout} before navigating).
 */
export function MasterDetail({
  master,
  detail,
  placeholder,
  masterWidth = 360,
  breakpoint = MASTER_DETAIL_BREAKPOINT,
  className,
}: MasterDetailProps) {
  const isWide = useIsWideLayout(breakpoint);

  if (!isWide) {
    return <View className={cn("flex-1", className)}>{master}</View>;
  }

  return (
    <View className={cn("flex-1 flex-row", className)}>
      <View className="border-r border-border" style={{ width: masterWidth }}>
        {master}
      </View>
      <View className="flex-1">
        {detail ?? (
          <View className="flex-1 items-center justify-center">
            {typeof placeholder === "string" || placeholder == null ? (
              <Text size="sm" tone="muted">
                {typeof placeholder === "string" ? placeholder : ""}
              </Text>
            ) : (
              placeholder
            )}
          </View>
        )}
      </View>
    </View>
  );
}
