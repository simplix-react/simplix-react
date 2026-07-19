import { Fragment, useEffect, useMemo, useState } from "react";
import { endOfDay, format, isToday, startOfDay } from "date-fns";

import { cn } from "../../lib/cn";
import { getVisibleHours, patternClass } from "../../helpers";
import { dayHighlightBgClass, dotBgClass, timelineBarClass } from "../../lib/item-colors";
import { dayKey, useDayHighlights } from "../../lib/day-highlights";
import { dateToMinutes, minutesToPercent, parseHmToMinutes } from "../../lib/time-axis";
import { useCalendarData, useCalendarPreferences } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem, CalendarResource } from "../../model/types";
import { DayHighlightBadge } from "../day-highlight-badge";
import { ResourceAvatar } from "../resource-avatar";

const LABEL_COL_CLASS = "w-56 shrink-0 border-r";
const MIN_TRACK_WIDTH_PX = 640;
/** Bars never collapse below this width, however short the interval. */
const MIN_BAR_WIDTH_PX = 14;

interface GanttViewProps {
  /** Items already scoped to the visible window (and resource filter) by CalendarBody. */
  items: CalendarItem[];
  /** The dates rendered as vertical row groups (1 for gantt-day, 7 for gantt-week). */
  days: Date[];
}

interface GanttRow {
  resource: CalendarResource;
  items: CalendarItem[];
}

function isMarker(item: CalendarItem): boolean {
  return item.start.getTime() === item.end.getTime();
}

/** Longest-first so wider bars paint below narrower inner segments (breaks, tails). */
function byDurationDesc(a: CalendarItem, b: CalendarItem): number {
  return b.end.getTime() - b.start.getTime() - (a.end.getTime() - a.start.getTime());
}

/** Rough label width at the 0.625rem bar font (CJK ≈ 10px, ASCII ≈ 5.5px) plus padding. */
function estimateLabelWidth(title: string): number {
  let width = 16;
  for (const ch of title) {
    width += ch.charCodeAt(0) > 0x2e80 ? 10 : 5.5;
  }
  return width;
}

/**
 * Horizontal Gantt view: dates stack vertically, time runs horizontally, and
 * every resource of a date gets one text-line-height row. Overlapping items in
 * a row paint longest-first, so shorter segments read as inner bars of the
 * enclosing longer bar. Zero-duration items render as dot markers. The
 * consumer can append per-row metadata (totals, badges) through the
 * `renderGanttRowExtra` plugin slot.
 */
export function GanttView({ items, days }: GanttViewProps) {
  const { resources, onItemClick, onCellClick, onResourceClick, timeBands, renderGanttRowExtra, timelineEmptyState } =
    useCalendarData();
  const { visibleHours } = useCalendarPreferences();
  const { t, locale } = useCalendarTranslation();
  const highlights = useDayHighlights();

  // Track width drives the inside-vs-outside bar label decision, so a short
  // bar never truncates its label — the text moves next to the bar instead.
  // State-held element (not a plain ref): the track only exists once rows
  // exist, which can be after mount when the row data loads lazily.
  const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  useEffect(() => {
    if (!trackEl) return;
    const update = () => setTrackWidth(trackEl.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [trackEl]);

  const { hours, earliestItemHour, latestItemHour } = getVisibleHours(visibleHours, items);

  const groups = useMemo(() => {
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const byResource = new Map<string, CalendarItem[]>();
      for (const item of items) {
        if (!item.resourceId) continue;
        if (item.start > dayEnd || item.end < dayStart) continue;
        const list = byResource.get(item.resourceId) ?? [];
        list.push(item);
        byResource.set(item.resourceId, list);
      }
      const rows: GanttRow[] = [];
      for (const resource of resources) {
        const rowItems = byResource.get(resource.id);
        if (rowItems) rows.push({ resource, items: rowItems.sort(byDurationDesc) });
      }
      return { day, rows };
    });
  }, [days, items, resources]);

  const totalRows = groups.reduce((sum, group) => sum + group.rows.length, 0);
  if (totalRows === 0) {
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

  const pct = (minutes: number) => minutesToPercent(minutes, earliestItemHour, latestItemHour);

  const timeBackground = (
    <>
      {(timeBands ?? []).map((band, index) => {
        const left = pct(parseHmToMinutes(band.start));
        const right = pct(parseHmToMinutes(band.end));
        return (
          <div
            key={`band-${index}`}
            className={cn(
              "absolute inset-y-0",
              band.kind === "recognized" ? "bg-primary/5" : "border-x border-primary/40 bg-primary/[0.03]"
            )}
            style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }}
          />
        );
      })}
      {hours.map((hour, index) =>
        index === 0 ? null : (
          <div key={hour} className="absolute inset-y-0 border-l" style={{ left: `${pct(hour * 60)}%` }} />
        )
      )}
    </>
  );

  return (
    // Height-constrained so both scrollbars pin to the viewport edges (a natural-height
    // container would bury the horizontal scrollbar below tall row lists). The
    // data-calendar-slot hook opts this scroller out of the consuming app's global
    // thin overlay scrollbars — see the calendar package styles.css.
    <div data-calendar-slot="scroll" className="h-full overflow-auto">
      <div style={{ minWidth: MIN_TRACK_WIDTH_PX }}>
        {/* Hour scale header — frozen to the top on vertical scroll. */}
        <div className="sticky top-0 z-40 flex border-b bg-background">
          {/* Top-left corner: frozen on both axes so it stays over the label column and hour ticks. */}
          <div className={cn(LABEL_COL_CLASS, "sticky left-0 z-10 bg-background")} />
          <div ref={setTrackEl} className="relative h-7 flex-1">
            {/* Labels sit to the right of their tick so no gridline crosses the text. */}
            {hours.map((hour) => (
              <span
                key={hour}
                className="absolute top-1.5 pl-1 text-[0.625rem] text-muted-foreground"
                style={{ left: `${pct(hour * 60)}%` }}
              >
                {String(hour).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>

        {groups.map(({ day, rows }) => {
          const highlight = highlights.get(dayKey(day));
          return (
            <div key={day.toISOString()}>
              {/* Date group header row. */}
              <button
                type="button"
                onClick={() => onCellClick?.(day)}
                className={cn(
                  "flex w-full items-center border-b bg-muted/40 py-1 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                  highlight && dayHighlightBgClass(highlight.color)
                )}
              >
                {/* Group label stays pinned to the left while the timeline scrolls horizontally. */}
                <span className="sticky left-0 flex items-center gap-2 px-3">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isToday(day) &&
                        "flex h-5 items-center justify-center rounded-full bg-primary px-2 text-primary-foreground"
                    )}
                  >
                    {format(day, "M/d EEE", { locale })}
                  </span>
                  {highlight?.label && <DayHighlightBadge color={highlight.color} label={highlight.label} />}
                  <span className="text-[0.625rem] text-muted-foreground">{rows.length}</span>
                </span>
              </button>

              {rows.map(({ resource, items: rowItems }) => (
                <div key={`${dayKey(day)}-${resource.id}`} className="flex h-12 border-b">
                  <button
                    type="button"
                    onClick={() => onResourceClick?.(resource, day)}
                    className={cn(
                      LABEL_COL_CLASS,
                      // Frozen to the left on horizontal scroll; solid bg + z above bars/markers so
                      // the timeline slides underneath cleanly.
                      "sticky left-0 z-30 flex items-center gap-2 overflow-hidden bg-background px-3 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                    )}
                  >
                    <ResourceAvatar name={resource.name} src={resource.avatarUrl} fallbackSrc={resource.avatarFallbackUrl} />
                    <span className="truncate text-xs font-medium">{resource.name}</span>
                    {renderGanttRowExtra?.(resource, day)}
                  </button>

                  <div className="relative min-w-0 flex-1">
                    {timeBackground}
                    {rowItems.map((item, itemIndex) => {
                      if (isMarker(item)) {
                        return (
                          <span
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            title={item.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick?.(item);
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter" && e.key !== " ") return;
                              e.stopPropagation();
                              onItemClick?.(item);
                            }}
                            className={cn(
                              "absolute top-1/2 z-20 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background",
                              dotBgClass(item.color)
                            )}
                            style={{ left: `${pct(dateToMinutes(item.start))}%` }}
                          />
                        );
                      }

                      const effStart = item.start < startOfDay(day) ? 0 : dateToMinutes(item.start);
                      const effEnd = item.end > endOfDay(day) ? 24 * 60 : dateToMinutes(item.end);
                      const left = pct(effStart);
                      const width = Math.max(pct(effEnd) - left, 0.5);
                      const barPx = trackWidth === 0 ? Number.POSITIVE_INFINITY : Math.max((width / 100) * trackWidth, MIN_BAR_WIDTH_PX);
                      // Inner segments (breaks, tails contained by a longer bar)
                      // get extra vertical inset so they read as nested bars.
                      const inner = rowItems
                        .slice(0, itemIndex)
                        .some((outer) => !isMarker(outer) && outer.start <= item.start && outer.end >= item.end);
                      // The label never truncates: a bar too narrow for its label
                      // renders it in full next to the bar — except inner segments,
                      // which fall back to their tooltip to keep the outer bar clean.
                      const labelInside = !item.title || barPx >= estimateLabelWidth(item.title);
                      return (
                        <Fragment key={item.id}>
                          <div
                            role="button"
                            tabIndex={0}
                            title={item.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick?.(item);
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter" && e.key !== " ") return;
                              e.stopPropagation();
                              onItemClick?.(item);
                            }}
                            className={cn(
                              "absolute z-10 flex items-center rounded border px-1.5 text-[0.625rem] leading-none",
                              // Inner segments get extra inset and center their label.
                              inner ? "inset-y-3.5 justify-center" : "inset-y-2.5",
                              "overflow-hidden",
                              timelineBarClass(item.color),
                              patternClass(item.pattern)
                            )}
                            style={{ left: `${left}%`, width: `max(${width}%, ${MIN_BAR_WIDTH_PX}px)` }}
                          >
                            {labelInside && item.title && (
                              <span className="whitespace-nowrap font-medium">{item.title}</span>
                            )}
                          </div>
                          {!labelInside && !inner && (
                            <span
                              className="pointer-events-none absolute inset-y-0 z-[5] flex items-center whitespace-nowrap text-[0.625rem] font-medium text-muted-foreground"
                              style={{ left: `calc(${left + width}% + 4px)` }}
                            >
                              {item.title}
                            </span>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
