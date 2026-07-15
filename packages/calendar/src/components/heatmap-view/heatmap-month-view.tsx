import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";

import { getCalendarCells } from "../../helpers";
import { dayKey, useDayHighlights } from "../../lib/day-highlights";
import { useCalendarData, useCalendarDate } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { HeatmapDayCell } from "./heatmap-day-cell";

/** Month grid whose day cells render a 24-slot occupancy heat strip from injected aggregates. */
export function HeatmapMonthView() {
  const { heatmap, heatmapMax } = useCalendarData();
  const { selectedDate } = useCalendarDate();
  const { t, locale } = useCalendarTranslation();
  const highlights = useDayHighlights();

  const cells = useMemo(() => getCalendarCells(selectedDate, locale), [selectedDate, locale]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale });
    return Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "EEE", { locale }));
  }, [locale]);

  const countsByDay = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const bucket of heatmap ?? []) {
      let slots = map.get(bucket.date);
      if (!slots) {
        slots = new Array(24).fill(0);
        map.set(bucket.date, slots);
      }
      if (bucket.hour >= 0 && bucket.hour < 24) slots[bucket.hour] += bucket.count;
    }
    return map;
  }, [heatmap]);

  const scaleMax = useMemo(() => {
    if (heatmapMax && heatmapMax > 0) return heatmapMax;
    let max = 0;
    for (const cell of cells) {
      if (!cell.currentMonth) continue;
      const slots = countsByDay.get(dayKey(cell.date));
      if (slots) max = Math.max(max, ...slots);
    }
    return max || 1;
  }, [heatmapMax, countsByDay, cells]);

  return (
    <div>
      <div className="flex items-center justify-end gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <span>{t("heatmap.less")}</span>
        <div className="h-2 w-24 rounded-full bg-gradient-to-r from-primary/10 to-primary" />
        <span>{t("heatmap.more")}</span>
      </div>

      <div className="grid grid-cols-7 divide-x">
        {weekDays.map((day, index) => (
          <div key={index} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell) => (
          <HeatmapDayCell
            key={cell.date.toISOString()}
            cell={cell}
            counts={countsByDay.get(dayKey(cell.date))}
            max={scaleMax}
            highlight={highlights.get(dayKey(cell.date))}
          />
        ))}
      </div>
    </div>
  );
}
