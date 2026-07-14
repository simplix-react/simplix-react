[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarApi

# Interface: CalendarApi

Defined in: [context/calendar-api-bridge.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-api-bridge.tsx#L8)

Imperative calendar control exposed through [CalendarApiBridge](../functions/CalendarApiBridge.md).

## Properties

### goTo()

> **goTo**: (`date`, `view?`) => `void`

Defined in: [context/calendar-api-bridge.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-api-bridge.tsx#L14)

Navigate to a date, optionally switching the view (drill-down).

#### Parameters

##### date

`Date`

##### view?

[`CalendarView`](../type-aliases/CalendarView.md)

#### Returns

`void`

***

### setDate()

> **setDate**: (`date`) => `void`

Defined in: [context/calendar-api-bridge.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-api-bridge.tsx#L12)

Move the selected date without changing the view.

#### Parameters

##### date

`Date`

#### Returns

`void`

***

### setView()

> **setView**: (`view`) => `void`

Defined in: [context/calendar-api-bridge.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/context/calendar-api-bridge.tsx#L10)

Switch the active view.

#### Parameters

##### view

[`CalendarView`](../type-aliases/CalendarView.md)

#### Returns

`void`
