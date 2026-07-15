[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarShellProps

# Interface: CalendarShellProps

Defined in: [components/calendar-shell.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/components/calendar-shell.tsx#L9)

Props for [CalendarShell](../functions/CalendarShell.md).

## Extends

- [`CalendarHeaderProps`](CalendarHeaderProps.md)

## Properties

### sidePanel?

> `optional` **sidePanel**: `ReactNode`

Defined in: [components/calendar-shell.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/components/calendar-shell.tsx#L15)

Fixed-width column rendered to the right of the scrolling calendar body,
below the header line (e.g. a summary or detail panel). It scrolls
independently so switching views never shifts the layout.

***

### sidePanelClassName?

> `optional` **sidePanelClassName**: `string`

Defined in: [components/calendar-shell.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/components/calendar-shell.tsx#L17)

Width class for the side panel column. Defaults to `w-72`.

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [components/header/calendar-header.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/components/header/calendar-header.tsx#L41)

Actions rendered after the view switcher (e.g. an add-item button).

#### Inherited from

[`CalendarHeaderProps`](CalendarHeaderProps.md).[`trailing`](CalendarHeaderProps.md#trailing)

***

### views?

> `optional` **views**: [`CalendarView`](../type-aliases/CalendarView.md)[]

Defined in: [components/header/calendar-header.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/components/header/calendar-header.tsx#L39)

Restricts and orders the view-switcher buttons. Defaults to the five base
views; the data-driven views (resource-timeline, heatmap-month) render
only when opted in here. A single entry hides the switcher entirely.

#### Inherited from

[`CalendarHeaderProps`](CalendarHeaderProps.md).[`views`](CalendarHeaderProps.md#views)
