[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:217](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L217)

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:225](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L225)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:222](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L222)

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:218](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L218)

***

### format?

> `optional` **format**: `"date"` \| `"relative"` \| `"datetime"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:223](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L223)

***

### header?

> `optional` **header**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:219](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L219)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:220](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L220)

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"destructive"` \| `"outline"` \| `"secondary"` \| `"success"` \| `"warning"` \| `"slate"` \| `"red"` \| `"orange"` \| `"amber"` \| `"yellow"` \| `"lime"` \| `"green"` \| `"emerald"` \| `"teal"` \| `"cyan"` \| `"sky"` \| `"blue"` \| `"indigo"` \| `"violet"` \| `"purple"` \| `"fuchsia"` \| `"pink"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:224](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L224)

***

### width?

> `optional` **width**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:221](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L221)
