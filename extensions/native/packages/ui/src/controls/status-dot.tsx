import { View } from "react-native";

import { cn } from "../utils/cn";
import { STATUS_TONES, type StatusTone } from "./status-tone";

/** Props for the {@link StatusDot} component. */
export interface StatusDotProps {
  /** Semantic status tone. */
  tone: StatusTone;
  /** Diameter preset. */
  size?: "sm" | "md";
  className?: string;
}

/** Solid status indicator dot bound to the {@link StatusTone} vocabulary. */
export function StatusDot({ tone, size = "md", className }: StatusDotProps) {
  return (
    <View
      accessibilityElementsHidden
      className={cn(
        "rounded-full",
        size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
        STATUS_TONES[tone].dot,
        className,
      )}
    />
  );
}
