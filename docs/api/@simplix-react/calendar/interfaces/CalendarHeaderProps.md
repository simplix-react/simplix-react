[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarHeaderProps

# Interface: CalendarHeaderProps

Defined in: [components/header/calendar-header.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/components/header/calendar-header.tsx#L33)

Props for [CalendarHeader](../functions/CalendarHeader.md).

## Extended by

- [`CalendarShellProps`](CalendarShellProps.md)

## Properties

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [components/header/calendar-header.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/components/header/calendar-header.tsx#L41)

Actions rendered after the view switcher (e.g. an add-item button).

***

### views?

> `optional` **views**: [`CalendarView`](../type-aliases/CalendarView.md)[]

Defined in: [components/header/calendar-header.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/components/header/calendar-header.tsx#L39)

Restricts and orders the view-switcher buttons. Defaults to the five base
views; the data-driven views (resource-timeline, heatmap-month) render
only when opted in here. A single entry hides the switcher entirely.
