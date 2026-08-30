[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChoiceChipsProps

# Interface: ChoiceChipsProps\<T\>

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L34)

Props for [ChoiceChips](../functions/ChoiceChips.md).

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

## Properties

### gap?

> `optional` **gap**: `"none"` \| `"xs"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L44)

Space between chips.

#### Default Value

```ts
"xs"
```

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L42)

Names the group for assistive technology — 「인증 수단」.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L38)

Called with the pressed option's value. Pressing the lit chip does nothing.

#### Parameters

##### value

`T`

#### Returns

`void`

***

### options

> **options**: [`ChoiceChipOption`](ChoiceChipOption.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L40)

The options, in the order they are drawn.

***

### value

> **value**: `T` \| `null`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L36)

What is chosen now, `null` while nothing is.
