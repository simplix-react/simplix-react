import type { ReactNode } from "react";
import { Columns, Grid3x3, List, Grid2x2, CalendarRange, GanttChart, Thermometer, ChartGantt, ChartNoAxesGantt } from "lucide-react";
import { Button } from "@simplix-react/ui";

import { useCalendarView } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarView } from "../../model/types";
import { DateNavigator } from "./date-navigator";
import { ResourceSelect } from "./resource-select";
import { TodayButton } from "./today-button";

const BASE_VIEWS: CalendarView[] = ["day", "week", "month", "year", "agenda"];

const VIEW_BUTTONS: { view: CalendarView; icon: typeof List; labelKey: string }[] = [
  { view: "day", icon: List, labelKey: "accessibility.viewByDay" },
  { view: "week", icon: Columns, labelKey: "accessibility.viewByWeek" },
  { view: "month", icon: Grid2x2, labelKey: "accessibility.viewByMonth" },
  { view: "year", icon: Grid3x3, labelKey: "accessibility.viewByYear" },
  { view: "agenda", icon: CalendarRange, labelKey: "accessibility.viewByAgenda" },
  { view: "resource-timeline", icon: GanttChart, labelKey: "accessibility.viewByResourceTimeline" },
  { view: "heatmap-month", icon: Thermometer, labelKey: "accessibility.viewByHeatmap" },
  { view: "gantt-week", icon: ChartGantt, labelKey: "accessibility.viewByGanttWeek" },
  { view: "gantt-day", icon: ChartNoAxesGantt, labelKey: "accessibility.viewByGanttDay" },
];

function segmentRounding(index: number, count: number): string {
  if (index === 0) return "rounded-r-none";
  if (index === count - 1) return "-ml-px rounded-l-none";
  return "-ml-px rounded-none";
}

/** Props for {@link CalendarHeader}. */
export interface CalendarHeaderProps {
  /**
   * Restricts and orders the view-switcher buttons. Defaults to the five base
   * views; the data-driven views (resource-timeline, heatmap-month) render
   * only when opted in here. A single entry hides the switcher entirely.
   */
  views?: CalendarView[];
  /** Actions rendered after the view switcher (e.g. an add-item button). */
  trailing?: ReactNode;
}

/** Header with today/navigation controls, a view switcher, and the resource filter. */
export function CalendarHeader({ views = BASE_VIEWS, trailing }: CalendarHeaderProps) {
  const { currentView, setCurrentView } = useCalendarView();
  const { t } = useCalendarTranslation();

  const buttons = views
    .map((view) => VIEW_BUTTONS.find((button) => button.view === view))
    .filter((button): button is (typeof VIEW_BUTTONS)[number] => !!button);

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator />
      </div>

      <div className="flex w-full items-center gap-1.5 sm:w-auto">
        <ResourceSelect />

        {buttons.length > 1 && (
          <div className="inline-flex">
            {buttons.map(({ view, icon: Icon, labelKey }, index) => (
              <Button
                key={view}
                aria-label={t(labelKey)}
                title={t(labelKey)}
                size="icon"
                variant={currentView === view ? "default" : "outline"}
                className={`${segmentRounding(index, buttons.length)} [&_svg]:size-5`}
                onClick={() => setCurrentView(view)}
              >
                <Icon strokeWidth={1.8} />
              </Button>
            ))}
          </div>
        )}

        {trailing}
      </div>
    </div>
  );
}
