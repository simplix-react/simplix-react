[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RowActionDef

# Interface: RowActionDef\<T\>

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L39)

One row action. `label`/`icon` fall back to the type's defaults when omitted.

## Type Parameters

### T

`T`

## Properties

### disabled()?

> `optional` **disabled**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L45)

#### Parameters

##### row

`T`

#### Returns

`boolean`

***

### disabledReason()?

> `optional` **disabledReason**: (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L58)

Why this row cannot take the action, when it cannot.

<p><b>A disabled control that does not say why is a dead end.</b> The reader presses, nothing
happens, and they have no way to tell whether the record is in the wrong state, whether they
lack the permission, or whether the product is broken — and the three call for three different
next moves. Returning a sentence puts it in the tooltip, on the same control they pressed.

<p>Read only when `disabled` says so, so a row that can act carries no tooltip it does not
need. Where the reason is the same for every row, a constant string is what the function
returns.

#### Parameters

##### row

`T`

#### Returns

`string` \| `undefined`

***

### href()?

> `optional` **href**: (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:70](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L70)

Where the action takes the reader, when it is a destination rather than a change.

<p><b>A row that says 「가서 보기」 is still a row action.</b> Given `onClick` alone it is a
button that navigates, which reads to the browser as a press — no middle-click, no open in a
new tab, no address on hover. Given this it is a link wearing the action's shape, so the
column stays one thing and the reader keeps what a link gives them.

<p>`onClick` is still called where both are given, for a screen that has to record the
departure. A disabled action never navigates.

#### Parameters

##### row

`T`

#### Returns

`string` \| `undefined`

***

### icon?

> `optional` **icon**: `ReactNode` \| (`row`) => `ReactNode`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L43)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L42)

***

### onClick()

> **onClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L41)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### type

> **type**: [`ActionType`](../type-aliases/ActionType.md)

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L40)

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L44)

#### Parameters

##### row

`T`

#### Returns

`boolean`
