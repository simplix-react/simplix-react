[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:208](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L208)

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:216](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L216)

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

> `optional` **display**: `"boolean"` \| `"badge"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:213](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L213)

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:209](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L209)

***

### format?

> `optional` **format**: `"date"` \| `"relative"` \| `"datetime"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:214](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L214)

***

### header?

> `optional` **header**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:210](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L210)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:211](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L211)

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"blue"` \| `"cyan"` \| `"fuchsia"` \| `"green"` \| `"indigo"` \| `"lime"` \| `"orange"` \| `"pink"` \| `"purple"` \| `"red"` \| `"teal"` \| `"violet"` \| `"yellow"` \| `"destructive"` \| `"outline"` \| `"secondary"` \| `"success"` \| `"warning"` \| `"slate"` \| `"amber"` \| `"emerald"` \| `"sky"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:215](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L215)

***

### width?

> `optional` **width**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:212](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L212)
