[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarPlugins

# Interface: CalendarPlugins

Defined in: [context/calendar-context.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L38)

Data injected into the timeline and heatmap views.

## Extended by

- [`CalendarProviderProps`](CalendarProviderProps.md)

## Properties

### dayHighlights?

> `optional` **dayHighlights**: [`DayHighlight`](DayHighlight.md)[]

Defined in: [context/calendar-context.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L46)

Generic per-day emphasis applied across month/day/week/timeline (holiday mechanism).

***

### heatmap?

> `optional` **heatmap**: [`HeatmapCell`](HeatmapCell.md)[]

Defined in: [context/calendar-context.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L42)

Aggregate date×hour×count buckets for the heatmap month view.

***

### heatmapMax?

> `optional` **heatmapMax**: `number`

Defined in: [context/calendar-context.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L44)

Relative scale denominator; when absent, the visible month's max count is used.

***

### renderDayBadge()?

> `optional` **renderDayBadge**: (`date`) => `ReactNode`

Defined in: [context/calendar-context.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L48)

Render extra summary badges inside a heatmap day cell.

#### Parameters

##### date

`Date`

#### Returns

`ReactNode`

***

### renderDayContent()?

> `optional` **renderDayContent**: (`date`, `items`) => `ReactNode`

Defined in: [context/calendar-context.tsx:54](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L54)

Replaces the month-view day-cell item badges with consumer-rendered content
(e.g. per-day aggregate chips). Receives the cell date and the items that
overlap it; the day number and highlight label still render above.

#### Parameters

##### date

`Date`

##### items

[`CalendarItem`](CalendarItem.md)\<`unknown`\>[]

#### Returns

`ReactNode`

***

### renderGanttRowExtra()?

> `optional` **renderGanttRowExtra**: (`resource`, `date`) => `ReactNode`

Defined in: [context/calendar-context.tsx:64](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L64)

Appends metadata (worked totals, badges) after the resource name on a
gantt-view row. Receives the row's resource and date.

#### Parameters

##### resource

[`CalendarResource`](CalendarResource.md)

##### date

`Date`

#### Returns

`ReactNode`

***

### renderItemOverlay()?

> `optional` **renderItemOverlay**: (`item`) => `ReactNode`

Defined in: [context/calendar-context.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L68)

Render an action overlay pinned to a time-grid item's bottom-right corner.

#### Parameters

##### item

[`CalendarItem`](CalendarItem.md)

#### Returns

`ReactNode`

***

### renderWeekDayHeader()?

> `optional` **renderWeekDayHeader**: (`date`) => `ReactNode`

Defined in: [context/calendar-context.tsx:66](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L66)

Render an extra per-day summary block under the week-view day header.

#### Parameters

##### date

`Date`

#### Returns

`ReactNode`

***

### showItemCountBadge?

> `optional` **showItemCountBadge**: `boolean`

Defined in: [context/calendar-context.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L59)

Shows the item-count badge next to the header title. Defaults to true;
consumers whose data is not item-based (aggregate views) turn it off.

***

### timeBands?

> `optional` **timeBands**: [`TimeBand`](TimeBand.md)[]

Defined in: [context/calendar-context.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L40)

Full-width background bands drawn on the resource-timeline axis.

***

### timelineEmptyState?

> `optional` **timelineEmptyState**: `ReactNode`

Defined in: [context/calendar-context.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L74)

Replaces the built-in empty state of the gantt and resource-timeline views.
Consumers whose rows only exist for timed records use this to explain what
a rowless day means (e.g. "absences appear in the side panel").
