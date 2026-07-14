import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "../../lib/cn";
import { getVisibleHours } from "../../helpers";
import { dayHighlightBgClass } from "../../lib/item-colors";
import { dayKey, useDayHighlights } from "../../lib/day-highlights";
import { minutesToPercent, parseHmToMinutes } from "../../lib/time-axis";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { useCalendarDate, useCalendarPreferences, useCalendarResourceFilter, useCalendarData } from "../../context/calendar-context";
import type { CalendarItem } from "../../model/types";
import { HourLabels } from "../week-and-day-view/hour-labels";
import { DayHighlightBadge } from "../day-highlight-badge";
import { ResourceColumn } from "./resource-column";

const COL_WIDTH = 140;
const HEADER_HEIGHT = 48;
const HOUR_PX = 96;
const OVERSCAN = 2;
/** Frozen hour-label gutter width; excluded from the resource-column viewport math. */
const GUTTER_WIDTH = 72;

interface ResourceTimelineViewProps {
  /** Items already scoped to the selected day (and resource filter) by CalendarBody. */
  items: CalendarItem[];
}

/** Vertical time axis × one virtualized column per resource. */
export function ResourceTimelineView({ items }: ResourceTimelineViewProps) {
  const { selectedResourceId, resources } = useCalendarResourceFilter();
  const { visibleHours } = useCalendarPreferences();
  const { timeBands, timelineEmptyState } = useCalendarData();
  const { selectedDate } = useCalendarDate();
  const { t } = useCalendarTranslation();
  const highlights = useDayHighlights();
  const highlight = highlights.get(dayKey(selectedDate));

  const { hours, earliestItemHour, latestItemHour } = getVisibleHours(visibleHours, items);
  const bodyHeight = hours.length * HOUR_PX;

  const columns = useMemo(
    () => (selectedResourceId === "all" ? resources : resources.filter((r) => r.id === selectedResourceId)),
    [resources, selectedResourceId]
  );

  const itemsByResource = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const column of columns) map.set(column.id, []);
    for (const item of items) {
      if (!item.resourceId) continue;
      map.get(item.resourceId)?.push(item);
    }
    return map;
  }, [columns, items]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The frozen gutter overlays the scroller's left edge, so only the space beyond
  // it holds resource columns — exclude it from the fill/virtualization math.
  const effectiveWidth = Math.max(0, viewportWidth - GUTTER_WIDTH) || COL_WIDTH * 4;
  // Columns keep a fixed minimum but stretch to fill the viewport when few.
  const colWidth = columns.length > 0 ? Math.max(COL_WIDTH, Math.floor(effectiveWidth / columns.length)) : COL_WIDTH;
  const startIndex = Math.max(0, Math.floor(scrollLeft / colWidth) - OVERSCAN);
  const endIndex = Math.min(columns.length, Math.ceil((scrollLeft + effectiveWidth) / colWidth) + OVERSCAN);
  const visibleColumns = columns.slice(startIndex, endIndex);

  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        {timelineEmptyState ?? (
          <>
            <p className="text-sm font-medium text-muted-foreground">{t("timeline.noResources")}</p>
            <p className="text-xs text-muted-foreground">{t("timeline.noResourcesHint")}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {highlight && (
        <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2">
          <DayHighlightBadge color={highlight.color} label={highlight.label ?? ""} />
        </div>
      )}

      {/* One scroller for both axes so the horizontal scrollbar pins to the
          viewport edge instead of the bottom of the tall time grid. The hour
          gutter freezes to the left and resource headers freeze to the top, so
          the time axis stays aligned while resources scroll horizontally. */}
      <div
        ref={scrollRef}
        onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
        data-calendar-slot="scroll"
        className="relative min-h-0 flex-1 overflow-auto"
      >
        <div className="flex" style={{ width: GUTTER_WIDTH + columns.length * colWidth, height: HEADER_HEIGHT + bodyHeight }}>
          {/* Frozen hour gutter: the corner spacer stays in the top-left; the
              labels scroll vertically with the grid but stay pinned to the left. */}
          <div className="sticky left-0 z-30 shrink-0 border-r bg-background" style={{ width: GUTTER_WIDTH }}>
            <div className="sticky top-0 z-10 border-b bg-background" style={{ height: HEADER_HEIGHT }} />
            <HourLabels hours={hours} />
          </div>

          <div className="relative shrink-0" style={{ width: columns.length * colWidth, height: HEADER_HEIGHT + bodyHeight }}>
            {/* Full-width background: highlight shading, time bands, hour gridlines. */}
            <div className="pointer-events-none absolute inset-x-0" style={{ top: HEADER_HEIGHT, height: bodyHeight }}>
              {highlight && <div className={cn("absolute inset-0 opacity-60", dayHighlightBgClass(highlight.color))} />}

              {(timeBands ?? []).map((band, index) => {
                const top = minutesToPercent(parseHmToMinutes(band.start), earliestItemHour, latestItemHour);
                const bottom = minutesToPercent(parseHmToMinutes(band.end), earliestItemHour, latestItemHour);
                return (
                  <div
                    key={index}
                    className={cn(
                      "absolute inset-x-0",
                      band.kind === "recognized" ? "bg-primary/5" : "border-y border-primary/40 bg-primary/[0.03]"
                    )}
                    style={{ top: `${top}%`, height: `${Math.max(bottom - top, 0)}%` }}
                  />
                );
              })}

              {hours.map((hour, index) =>
                index === 0 ? null : <div key={hour} className="absolute inset-x-0 border-b" style={{ top: index * HOUR_PX }} />
              )}
            </div>

            {visibleColumns.map((resource, i) => (
              <ResourceColumn
                key={resource.id}
                resource={resource}
                items={itemsByResource.get(resource.id) ?? []}
                day={selectedDate}
                left={(startIndex + i) * colWidth}
                width={colWidth}
                headerHeight={HEADER_HEIGHT}
                bodyHeight={bodyHeight}
                firstHour={earliestItemHour}
                lastHour={latestItemHour}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
