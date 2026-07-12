import { format } from "date-fns";

import { getHourLabelFormat } from "../../lib/date-formats";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { useHourPx } from "./time-grid-context";

interface HourLabelsProps {
  hours: number[];
}

/** Left gutter column showing the hour of each row in the time grid. */
export function HourLabels({ hours }: HourLabelsProps) {
  const { language, locale } = useCalendarTranslation();
  const hourPx = useHourPx();

  return (
    <div className="relative w-[72px]">
      {hours.map((hour, index) => (
        <div key={hour} className="relative" style={{ height: `${hourPx}px` }}>
          <div className="absolute -top-3 right-2 flex h-6 items-center">
            {index !== 0 && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(new Date().setHours(hour, 0, 0, 0)), getHourLabelFormat(language), { locale })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
