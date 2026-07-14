[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableSlots

# Interface: ListTableSlots\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:300](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L300)

Per-instance render overrides for List.Table seams. Each slot replaces the
default rendering for that seam; omitted slots keep the built-in behavior.

## Type Parameters

### T

`T`

## Properties

### empty()?

> `optional` **empty**: (`ctx`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:304](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L304)

Replace the empty / filtered / error state body. Receives the reason.

#### Parameters

##### ctx

###### reason

[`EmptyReason`](../type-aliases/EmptyReason.md)

#### Returns

`ReactNode`

***

### rowActions()?

> `optional` **rowActions**: (`ctx`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:302](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L302)

Replace the per-row action cluster. Receives the row.

#### Parameters

##### ctx

###### row

`T`

#### Returns

`ReactNode`
