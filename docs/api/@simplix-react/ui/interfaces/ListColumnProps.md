[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: packages/ui/src/crud/list/crud-list.tsx:179

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: packages/ui/src/crud/list/crud-list.tsx:187

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

Defined in: packages/ui/src/crud/list/crud-list.tsx:184

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:180

***

### format?

> `optional` **format**: `"date"` \| `"datetime"` \| `"relative"`

Defined in: packages/ui/src/crud/list/crud-list.tsx:185

***

### header?

> `optional` **header**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:181

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: packages/ui/src/crud/list/crud-list.tsx:182

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"secondary"` \| `"destructive"` \| `"outline"` \| `"success"` \| `"warning"` \| `"slate"` \| `"red"` \| `"orange"` \| `"amber"` \| `"yellow"` \| `"lime"` \| `"green"` \| `"emerald"` \| `"teal"` \| `"cyan"` \| `"sky"` \| `"blue"` \| `"indigo"` \| `"violet"` \| `"purple"` \| `"fuchsia"` \| `"pink"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: packages/ui/src/crud/list/crud-list.tsx:186

***

### width?

> `optional` **width**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:183
