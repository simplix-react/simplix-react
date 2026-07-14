import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge, Button } from "@simplix-react/ui";

import { useCalendarData, useCalendarDate, useEffectiveRangeView } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { getItemsCount, navigateDate, rangeText } from "../../helpers";
import { formatDate } from "../../lib/date-formats";

/** Month/year label, item count badge, and previous/next controls. */
export function DateNavigator() {
  const { items, showItemCountBadge } = useCalendarData();
  const { selectedDate, setSelectedDate } = useCalendarDate();
  const { effectiveView } = useEffectiveRangeView();
  const { t, language, locale } = useCalendarTranslation();

  // Year-scoped views title with the year alone — a month in the title would
  // suggest a narrower window than the view actually shows.
  const titleFormat = effectiveView === "year" ? "yearRange" : "monthYear";
  const monthYearDisplay = formatDate(selectedDate, titleFormat, language, locale);
  const itemCount = useMemo(() => getItemsCount(items, selectedDate, effectiveView, locale), [items, selectedDate, effectiveView, locale]);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{monthYearDisplay}</span>
        {showItemCountBadge !== false && (
          <Badge variant="outline" className="px-1.5">
            {t("events.eventCount", { count: itemCount })}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="size-[26px] px-0 [&_svg]:size-[18px]" onClick={() => setSelectedDate(navigateDate(selectedDate, effectiveView, "previous"))}>
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">{rangeText(effectiveView, selectedDate, language, locale)}</p>

        <Button variant="outline" className="size-[26px] px-0 [&_svg]:size-[18px]" onClick={() => setSelectedDate(navigateDate(selectedDate, effectiveView, "next"))}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
