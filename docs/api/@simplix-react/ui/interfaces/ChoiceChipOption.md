[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChoiceChipOption

# Interface: ChoiceChipOption\<T\>

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L8)

One option of a [ChoiceChips](../functions/ChoiceChips.md) row.

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

## Properties

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L21)

Whether this option can be chosen right now.

***

### disabledReason?

> `optional` **disabledReason**: `string`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L30)

Why it cannot be, in the reader's words.

<p><b>A chip that is there and refuses teaches something a chip that vanished cannot.</b> An
option removed from the row says the product does not offer it; an option standing there
disabled says this account has not set it up — and only the second is usually true. The
sentence is what makes the difference legible, so a disabled chip without one is a dead end.

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L19)

Replaces the chosen/unchosen mark with something else — a colour dot, a count.

<p>Supplying one gives up the mark that says whether this chip is on, so only pass it where
the chip's own colour already carries that.

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L12)

Display label.

***

### value

> **value**: `T`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L10)

The value this chip stands for.
