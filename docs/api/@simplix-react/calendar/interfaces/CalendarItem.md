[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarItem

# Interface: CalendarItem\<T\>

Defined in: [model/types.ts:93](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L93)

A single scheduled item. The core works exclusively with `Date` fields;
consumers convert their DTOs (usually ISO strings) via an adapter and keep
the original DTO on [CalendarItem.payload](#payload).

Every view positions and day-attributes items by reading the `Date`s' LOCAL
fields (wall clock). To render absolute instants in an explicit display zone
(a site's clock rather than the browser's), the adapter must convert them to
floating carriers whose local fields hold that zone's wall clock — e.g.
`decodeInstant(iso, displayZone)` from `@simplix-react/ui` — instead of
`new Date(iso)`. Zone-free values (a calendar date plus an `"HH:mm"` wall
clock) are already carriers and need no conversion.

## Type Parameters

### T

`T` = `unknown`

The original domain DTO carried through untouched.

## Properties

### allDay?

> `optional` **allDay**: `boolean`

Defined in: [model/types.ts:105](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L105)

***

### color

> **color**: [`CalendarColor`](../type-aliases/CalendarColor.md)

Defined in: [model/types.ts:100](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L100)

***

### end

> **end**: `Date`

Defined in: [model/types.ts:99](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L99)

End of the item — a `Date` whose LOCAL fields are the display wall clock.

***

### id

> **id**: `string`

Defined in: [model/types.ts:94](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L94)

***

### pattern?

> `optional` **pattern**: [`EventPattern`](../type-aliases/EventPattern.md)

Defined in: [model/types.ts:102](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L102)

Visual treatment hint; defaults to a solid fill.

***

### payload

> **payload**: `T`

Defined in: [model/types.ts:109](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L109)

The untouched domain object this item was derived from.

***

### resizable?

> `optional` **resizable**: `boolean`

Defined in: [model/types.ts:104](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L104)

Enables edge drag-resize in the week/day time grids (requires `onItemResize`).

***

### resourceId?

> `optional` **resourceId**: `string`

Defined in: [model/types.ts:107](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L107)

Owning resource id; looked up against the provider's `resources`.

***

### start

> **start**: `Date`

Defined in: [model/types.ts:97](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L97)

Start of the item — a `Date` whose LOCAL fields are the display wall clock.

***

### title

> **title**: `string`

Defined in: [model/types.ts:95](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L95)
