import { Badge } from "@simplix-react/ui";

import type { CalendarColor } from "../model/types";

// Map calendar colors to framework Badge palette variants (gray → slate).
const BADGE_VARIANT = {
  blue: "blue",
  green: "green",
  red: "red",
  yellow: "yellow",
  purple: "purple",
  orange: "orange",
  gray: "slate",
  teal: "teal",
} as const satisfies Record<CalendarColor, string>;

interface DayHighlightBadgeProps {
  color: CalendarColor;
  label: string;
}

/** Small badge shown in day/week/timeline headers for a highlighted day (e.g. holiday). */
export function DayHighlightBadge({ color, label }: DayHighlightBadgeProps) {
  return (
    <Badge variant={BADGE_VARIANT[color]} className="px-1.5">
      {label}
    </Badge>
  );
}
