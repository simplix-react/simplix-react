import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { dotBgClass } from "../lib/item-colors";
import type { CalendarColor } from "../model/types";

/** One legend entry: a calendar color dot with its label. */
export interface CalendarLegendItem {
  color: CalendarColor;
  label: ReactNode;
}

/** Props for {@link CalendarColorLegend}. */
export interface CalendarColorLegendProps {
  items: CalendarLegendItem[];
  className?: string;
}

/**
 * Inline dot-and-label legend for the calendar color palette, matching the
 * dot treatment used by the calendar views.
 */
export function CalendarColorLegend({ items, className }: CalendarColorLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <span className={cn("size-2 rounded-full", dotBgClass(item.color))} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
