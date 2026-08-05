[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSelection

# Interface: CrudListSelection\<T\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L74)

Selection state returned by [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

## Properties

### clear()

> **clear**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L78)

#### Returns

`void`

***

### isSelected()

> **isSelected**: (`index`) => `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:79](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L79)

#### Parameters

##### index

`number`

#### Returns

`boolean`

***

### selected

> **selected**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L75)

***

### toggle()

> **toggle**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L76)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### toggleAll()

> **toggleAll**: (`data`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L77)

#### Parameters

##### data

`T`[]

#### Returns

`void`
