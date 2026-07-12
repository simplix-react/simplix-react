import { format } from "date-fns";

import { useCalendarDate } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";

/** Compact "jump to today" button showing the current month/day. */
export function TodayButton() {
  const { setSelectedDate } = useCalendarDate();
  const { locale } = useCalendarTranslation();

  const today = new Date();
  const monthAbbr = format(today, "MMM", { locale }).toUpperCase();

  return (
    <button
      className="flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onClick={() => setSelectedDate(new Date())}
      type="button"
    >
      <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-primary-foreground">{monthAbbr}</p>
      <p className="flex w-full items-center justify-center text-lg font-bold">{today.getDate()}</p>
    </button>
  );
}
