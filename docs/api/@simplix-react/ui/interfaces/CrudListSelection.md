[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSelection

# Interface: CrudListSelection\<T\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L89)

Selection state returned by [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

## Properties

### clear()

> **clear**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:93](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L93)

#### Returns

`void`

***

### isSelected()

> **isSelected**: (`index`) => `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L94)

#### Parameters

##### index

`number`

#### Returns

`boolean`

***

### selected

> **selected**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L90)

***

### toggle()

> **toggle**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L91)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### toggleAll()

> **toggleAll**: (`data`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L92)

#### Parameters

##### data

`T`[]

#### Returns

`void`
