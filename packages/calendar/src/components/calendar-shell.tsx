import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { CalendarBody } from "./calendar-body";
import { CalendarHeader } from "./header/calendar-header";
import type { CalendarHeaderProps } from "./header/calendar-header";

/** Props for {@link CalendarShell}. */
export interface CalendarShellProps extends CalendarHeaderProps {
  /**
   * Fixed-width column rendered to the right of the scrolling calendar body,
   * below the header line (e.g. a summary or detail panel). It scrolls
   * independently so switching views never shifts the layout.
   */
  sidePanel?: ReactNode;
  /** Width class for the side panel column. Defaults to `w-72`. */
  sidePanelClassName?: string;
}

/**
 * Standard calendar chrome inside a {@link CalendarProvider}: a fixed
 * {@link CalendarHeader} above a {@link CalendarBody} that scrolls in its own
 * viewport, with an optional independently scrolling side panel. Mount it in a
 * min-height-0 flex column; compose header/body manually only when this shape
 * does not fit.
 */
export function CalendarShell({ views, trailing, sidePanel, sidePanelClassName }: CalendarShellProps) {
  const main = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CalendarHeader views={views} trailing={trailing} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CalendarBody />
      </div>
    </div>
  );

  if (!sidePanel) return main;

  return (
    <div className="flex min-h-0 flex-1 items-stretch">
      {main}
      <div className={cn("flex min-h-0 shrink-0 flex-col overflow-y-auto border-l", sidePanelClassName ?? "w-72")}>
        {sidePanel}
      </div>
    </div>
  );
}
