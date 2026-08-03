[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RowActionDef

# Interface: RowActionDef\<T\>

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L27)

One row action. `label`/`icon` fall back to the type's defaults when omitted.

## Type Parameters

### T

`T`

## Properties

### disabled()?

> `optional` **disabled**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L33)

#### Parameters

##### row

`T`

#### Returns

`boolean`

***

### icon?

> `optional` **icon**: `ReactNode` \| (`row`) => `ReactNode`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L31)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L30)

***

### onClick()

> **onClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L29)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### type

> **type**: [`ActionType`](../type-aliases/ActionType.md)

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L28)

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L32)

#### Parameters

##### row

`T`

#### Returns

`boolean`
