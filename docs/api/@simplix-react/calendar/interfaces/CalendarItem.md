[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / CalendarItem

# Interface: CalendarItem\<T\>

Defined in: [model/types.ts:83](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L83)

A single scheduled item. The core works exclusively with `Date` fields;
consumers convert their DTOs (usually ISO strings) via an adapter and keep
the original DTO on [CalendarItem.payload](#payload).

## Type Parameters

### T

`T` = `unknown`

The original domain DTO carried through untouched.

## Properties

### allDay?

> `optional` **allDay**: `boolean`

Defined in: [model/types.ts:95](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L95)

***

### color

> **color**: [`CalendarColor`](../type-aliases/CalendarColor.md)

Defined in: [model/types.ts:90](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L90)

***

### end

> **end**: `Date`

Defined in: [model/types.ts:89](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L89)

End instant. Already converted to a `Date` by the consumer.

***

### id

> **id**: `string`

Defined in: [model/types.ts:84](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L84)

***

### pattern?

> `optional` **pattern**: [`EventPattern`](../type-aliases/EventPattern.md)

Defined in: [model/types.ts:92](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L92)

Visual treatment hint; defaults to a solid fill.

***

### payload

> **payload**: `T`

Defined in: [model/types.ts:99](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L99)

The untouched domain object this item was derived from.

***

### resizable?

> `optional` **resizable**: `boolean`

Defined in: [model/types.ts:94](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L94)

Enables edge drag-resize in the week/day time grids (requires `onItemResize`).

***

### resourceId?

> `optional` **resourceId**: `string`

Defined in: [model/types.ts:97](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L97)

Owning resource id; looked up against the provider's `resources`.

***

### start

> **start**: `Date`

Defined in: [model/types.ts:87](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L87)

Start instant. Already converted to a `Date` by the consumer.

***

### title

> **title**: `string`

Defined in: [model/types.ts:85](https://github.com/simplix-react/simplix-react/blob/main/model/types.ts#L85)
