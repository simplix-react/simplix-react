[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSelection

# Interface: CrudListSelection\<T\>

Defined in: packages/ui/src/crud/list/use-crud-list.ts:52

Selection state returned by [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

## Properties

### clear()

> **clear**: () => `void`

Defined in: packages/ui/src/crud/list/use-crud-list.ts:56

#### Returns

`void`

***

### isSelected()

> **isSelected**: (`index`) => `boolean`

Defined in: packages/ui/src/crud/list/use-crud-list.ts:57

#### Parameters

##### index

`number`

#### Returns

`boolean`

***

### selected

> **selected**: `Set`\<`number`\>

Defined in: packages/ui/src/crud/list/use-crud-list.ts:53

***

### toggle()

> **toggle**: (`index`) => `void`

Defined in: packages/ui/src/crud/list/use-crud-list.ts:54

#### Parameters

##### index

`number`

#### Returns

`void`

***

### toggleAll()

> **toggleAll**: (`data`) => `void`

Defined in: packages/ui/src/crud/list/use-crud-list.ts:55

#### Parameters

##### data

`T`[]

#### Returns

`void`
