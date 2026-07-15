[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / createCalendarStore

# Function: createCalendarStore()

> **createCalendarStore**(`options?`): `StoreApi`\<[`CalendarStoreState`](../interfaces/CalendarStoreState.md)\>

Defined in: [model/calendar-store.ts:66](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L66)

Creates an isolated calendar store so multiple calendars can coexist on one page.

State is never persisted; the consumer provides initial values through the provider.

## Parameters

### options?

[`CreateCalendarStoreOptions`](../interfaces/CreateCalendarStoreOptions.md) = `{}`

## Returns

`StoreApi`\<[`CalendarStoreState`](../interfaces/CalendarStoreState.md)\>
