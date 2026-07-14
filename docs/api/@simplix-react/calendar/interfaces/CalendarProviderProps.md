[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarProviderProps

# Interface: CalendarProviderProps

Defined in: [context/calendar-context.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L78)

Props for [CalendarProvider](../functions/CalendarProvider.md).

## Extends

- [`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`CalendarCallbacks`](CalendarCallbacks.md).[`CalendarPlugins`](CalendarPlugins.md)

## Properties

### agendaScope?

> `optional` **agendaScope**: [`AgendaScope`](../type-aliases/AgendaScope.md)

Defined in: [model/calendar-store.ts:48](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L48)

Agenda view span: one month (default) or the whole year.

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`agendaScope`](CreateCalendarStoreOptions.md#agendascope)

***

### badgeVariant?

> `optional` **badgeVariant**: [`BadgeVariant`](../type-aliases/BadgeVariant.md)

Defined in: [model/calendar-store.ts:51](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L51)

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`badgeVariant`](CreateCalendarStoreOptions.md#badgevariant)

***

### children

> **children**: `ReactNode`

Defined in: [context/calendar-context.tsx:85](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L85)

***

### dayHighlights?

> `optional` **dayHighlights**: [`DayHighlight`](DayHighlight.md)[]

Defined in: [context/calendar-context.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L46)

Generic per-day emphasis applied across month/day/week/timeline (holiday mechanism).

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`dayHighlights`](CalendarPlugins.md#dayhighlights)

***

### defaultDate?

> `optional` **defaultDate**: `Date`

Defined in: [model/calendar-store.ts:49](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L49)

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`defaultDate`](CreateCalendarStoreOptions.md#defaultdate)

***

### defaultResourceId?

> `optional` **defaultResourceId**: `string`

Defined in: [model/calendar-store.ts:50](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L50)

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`defaultResourceId`](CreateCalendarStoreOptions.md#defaultresourceid)

***

### defaultView?

> `optional` **defaultView**: [`CalendarView`](../type-aliases/CalendarView.md)

Defined in: [model/calendar-store.ts:46](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L46)

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`defaultView`](CreateCalendarStoreOptions.md#defaultview)

***

### dndEnabled?

> `optional` **dndEnabled**: `boolean`

Defined in: [context/calendar-context.tsx:84](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L84)

Enable react-dnd drag-drop of items across cells/time slots.

***

### heatmap?

> `optional` **heatmap**: [`HeatmapCell`](HeatmapCell.md)[]

Defined in: [context/calendar-context.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L42)

Aggregate date×hour×count buckets for the heatmap month view.

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`heatmap`](CalendarPlugins.md#heatmap)

***

### heatmapMax?

> `optional` **heatmapMax**: `number`

Defined in: [context/calendar-context.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L44)

Relative scale denominator; when absent, the visible month's max count is used.

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`heatmapMax`](CalendarPlugins.md#heatmapmax)

***

### hourHeight?

> `optional` **hourHeight**: `number` \| `"fit"`

Defined in: [model/calendar-store.ts:55](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L55)

Pixels per hour in the time grids (default 96); `"fit"` fills the body height.

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`hourHeight`](CreateCalendarStoreOptions.md#hourheight)

***

### items

> **items**: [`CalendarItem`](CalendarItem.md)\<`unknown`\>[]

Defined in: [context/calendar-context.tsx:80](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L80)

Items to render. Consumer converts DTOs to the [CalendarItem](CalendarItem.md) shape.

***

### onCellClick()?

> `optional` **onCellClick**: (`date`) => `void`

Defined in: [context/calendar-context.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L23)

Fired when an empty cell/time slot is activated; receives the slot instant.

#### Parameters

##### date

`Date`

#### Returns

`void`

#### Inherited from

[`CalendarCallbacks`](CalendarCallbacks.md).[`onCellClick`](CalendarCallbacks.md#oncellclick)

***

### onItemClick()?

> `optional` **onItemClick**: (`item`) => `void`

Defined in: [context/calendar-context.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L21)

Fired when an item is activated (click/keyboard).

#### Parameters

##### item

[`CalendarItem`](CalendarItem.md)

#### Returns

`void`

#### Inherited from

[`CalendarCallbacks`](CalendarCallbacks.md).[`onItemClick`](CalendarCallbacks.md#onitemclick)

***

### onItemMove()?

> `optional` **onItemMove**: (`item`, `start`, `end`) => `void`

Defined in: [context/calendar-context.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L25)

Fired on a drag-drop move; receives the moved item and its new bounds.

#### Parameters

##### item

[`CalendarItem`](CalendarItem.md)

##### start

`Date`

##### end

`Date`

#### Returns

`void`

#### Inherited from

[`CalendarCallbacks`](CalendarCallbacks.md).[`onItemMove`](CalendarCallbacks.md#onitemmove)

***

### onItemResize()?

> `optional` **onItemResize**: (`item`, `start`, `end`) => `void`

Defined in: [context/calendar-context.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L27)

Fired when a resizable item's edge is drag-resized in the week/day grids.

#### Parameters

##### item

[`CalendarItem`](CalendarItem.md)

##### start

`Date`

##### end

`Date`

#### Returns

`void`

#### Inherited from

[`CalendarCallbacks`](CalendarCallbacks.md).[`onItemResize`](CalendarCallbacks.md#onitemresize)

***

### onRangeChange()?

> `optional` **onRangeChange**: (`range`) => `void`

Defined in: [context/calendar-context.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L29)

Fired whenever view/date navigation changes the visible range.

#### Parameters

##### range

[`CalendarRange`](CalendarRange.md)

#### Returns

`void`

#### Inherited from

[`CalendarCallbacks`](CalendarCallbacks.md).[`onRangeChange`](CalendarCallbacks.md#onrangechange)

***

### onResourceClick()?

> `optional` **onResourceClick**: (`resource`, `date?`) => `void`

Defined in: [context/calendar-context.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L34)

Fired when a resource label is activated (timeline column header or gantt
row label). Gantt rows also pass the row's date.

#### Parameters

##### resource

[`CalendarResource`](CalendarResource.md)

##### date?

`Date`

#### Returns

`void`

#### Inherited from

[`CalendarCallbacks`](CalendarCallbacks.md).[`onResourceClick`](CalendarCallbacks.md#onresourceclick)

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

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`renderDayBadge`](CalendarPlugins.md#renderdaybadge)

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

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`renderDayContent`](CalendarPlugins.md#renderdaycontent)

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

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`renderGanttRowExtra`](CalendarPlugins.md#renderganttrowextra)

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

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`renderItemOverlay`](CalendarPlugins.md#renderitemoverlay)

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

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`renderWeekDayHeader`](CalendarPlugins.md#renderweekdayheader)

***

### resources?

> `optional` **resources**: [`CalendarResource`](CalendarResource.md)[]

Defined in: [context/calendar-context.tsx:82](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L82)

Resource directory used to resolve `item.resourceId`.

***

### showItemCountBadge?

> `optional` **showItemCountBadge**: `boolean`

Defined in: [context/calendar-context.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L59)

Shows the item-count badge next to the header title. Defaults to true;
consumers whose data is not item-based (aggregate views) turn it off.

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`showItemCountBadge`](CalendarPlugins.md#showitemcountbadge)

***

### timeBands?

> `optional` **timeBands**: [`TimeBand`](TimeBand.md)[]

Defined in: [context/calendar-context.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L40)

Full-width background bands drawn on the resource-timeline axis.

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`timeBands`](CalendarPlugins.md#timebands)

***

### timelineEmptyState?

> `optional` **timelineEmptyState**: `ReactNode`

Defined in: [context/calendar-context.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L74)

Replaces the built-in empty state of the gantt and resource-timeline views.
Consumers whose rows only exist for timed records use this to explain what
a rowless day means (e.g. "absences appear in the side panel").

#### Inherited from

[`CalendarPlugins`](CalendarPlugins.md).[`timelineEmptyState`](CalendarPlugins.md#timelineemptystate)

***

### visibleHours?

> `optional` **visibleHours**: [`VisibleHours`](../type-aliases/VisibleHours.md)

Defined in: [model/calendar-store.ts:53](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L53)

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`visibleHours`](CreateCalendarStoreOptions.md#visiblehours)

***

### workingHours?

> `optional` **workingHours**: [`WorkingHours`](../type-aliases/WorkingHours.md)

Defined in: [model/calendar-store.ts:52](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L52)

#### Inherited from

[`CreateCalendarStoreOptions`](CreateCalendarStoreOptions.md).[`workingHours`](CreateCalendarStoreOptions.md#workinghours)
