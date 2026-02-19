[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:188](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L188)

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:196](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L196)

#### Parameters

##### props

###### row

`T`

###### value

`unknown`

#### Returns

`ReactNode`

***

### display?

> `optional` **display**: `"badge"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:193](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L193)

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:189](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L189)

***

### format?

> `optional` **format**: `"date"` \| `"relative"` \| `"datetime"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:194](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L194)

***

### header?

> `optional` **header**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:190](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L190)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:191](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L191)

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"secondary"` \| `"destructive"` \| `"outline"` \| `"success"` \| `"warning"` \| `"slate"` \| `"red"` \| `"orange"` \| `"amber"` \| `"yellow"` \| `"lime"` \| `"green"` \| `"emerald"` \| `"teal"` \| `"cyan"` \| `"sky"` \| `"blue"` \| `"indigo"` \| `"violet"` \| `"purple"` \| `"fuchsia"` \| `"pink"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:195](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L195)

***

### width?

> `optional` **width**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:192](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L192)
