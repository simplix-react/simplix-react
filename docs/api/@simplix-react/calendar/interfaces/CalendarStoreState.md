[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarStoreState

# Interface: CalendarStoreState

Defined in: [model/calendar-store.ts:23](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L23)

Reactive calendar state plus its setters.

## Properties

### agendaScope

> **agendaScope**: [`AgendaScope`](../type-aliases/AgendaScope.md)

Defined in: [model/calendar-store.ts:27](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L27)

Agenda view span: one month (default) or the whole year.

***

### badgeVariant

> **badgeVariant**: [`BadgeVariant`](../type-aliases/BadgeVariant.md)

Defined in: [model/calendar-store.ts:30](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L30)

***

### currentView

> **currentView**: [`CalendarView`](../type-aliases/CalendarView.md)

Defined in: [model/calendar-store.ts:24](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L24)

***

### hourHeight

> **hourHeight**: `number` \| `"fit"`

Defined in: [model/calendar-store.ts:34](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L34)

Pixels per hour in the time grids; `"fit"` scales rows to fill the body.

***

### selectedDate

> **selectedDate**: `Date`

Defined in: [model/calendar-store.ts:25](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L25)

***

### selectedResourceId

> **selectedResourceId**: `string`

Defined in: [model/calendar-store.ts:29](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L29)

`"all"` or a specific resource id used to filter items.

***

### setBadgeVariant()

> **setBadgeVariant**: (`variant`) => `void`

Defined in: [model/calendar-store.ts:39](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L39)

#### Parameters

##### variant

[`BadgeVariant`](../type-aliases/BadgeVariant.md)

#### Returns

`void`

***

### setCurrentView()

> **setCurrentView**: (`view`) => `void`

Defined in: [model/calendar-store.ts:36](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L36)

#### Parameters

##### view

[`CalendarView`](../type-aliases/CalendarView.md)

#### Returns

`void`

***

### setSelectedDate()

> **setSelectedDate**: (`date`) => `void`

Defined in: [model/calendar-store.ts:37](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L37)

#### Parameters

##### date

`Date`

#### Returns

`void`

***

### setSelectedResourceId()

> **setSelectedResourceId**: (`id`) => `void`

Defined in: [model/calendar-store.ts:38](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L38)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### setVisibleHours()

> **setVisibleHours**: (`hours`) => `void`

Defined in: [model/calendar-store.ts:41](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L41)

#### Parameters

##### hours

[`VisibleHours`](../type-aliases/VisibleHours.md)

#### Returns

`void`

***

### setWorkingHours()

> **setWorkingHours**: (`hours`) => `void`

Defined in: [model/calendar-store.ts:40](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L40)

#### Parameters

##### hours

[`WorkingHours`](../type-aliases/WorkingHours.md)

#### Returns

`void`

***

### visibleHours

> **visibleHours**: [`VisibleHours`](../type-aliases/VisibleHours.md)

Defined in: [model/calendar-store.ts:32](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L32)

***

### workingHours

> **workingHours**: [`WorkingHours`](../type-aliases/WorkingHours.md)

Defined in: [model/calendar-store.ts:31](https://github.com/simplix-react/simplix-react/blob/main/model/calendar-store.ts#L31)
