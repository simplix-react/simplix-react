[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarCallbacks

# Interface: CalendarCallbacks

Defined in: [context/calendar-context.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L19)

Consumer-supplied interaction callbacks. All optional.

## Extended by

- [`CalendarProviderProps`](CalendarProviderProps.md)

## Properties

### onCellClick()?

> `optional` **onCellClick**: (`date`) => `void`

Defined in: [context/calendar-context.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-context.tsx#L23)

Fired when an empty cell/time slot is activated; receives the slot instant.

#### Parameters

##### date

`Date`

#### Returns

`void`

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
