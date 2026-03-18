[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SearchPopoverProps

# Interface: SearchPopoverProps\<T\>

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L42)

Props for the [SearchPopover](../functions/SearchPopover.md) component.

## Type Parameters

### T

`T`

## Properties

### align?

> `optional` **align**: `"center"` \| `"end"` \| `"start"`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:64](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L64)

Popover alignment. Defaults to `"end"`.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L56)

Whether the trigger button is disabled.

***

### disabledReason?

> `optional` **disabledReason**: `string`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L58)

Tooltip text when disabled (e.g. max items reached).

***

### emptyMessage?

> `optional` **emptyMessage**: `string`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:62](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L62)

Message when no items match the search. Defaults to i18n `field.noResults`.

***

### getKey()

> **getKey**: (`item`) => `string`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L52)

Extract unique key from an item.

#### Parameters

##### item

`T`

#### Returns

`string`

***

### getLabel()

> **getLabel**: (`item`) => `string`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L50)

Extract display label from an item.

#### Parameters

##### item

`T`

#### Returns

`string`

***

### groups?

> `optional` **groups**: [`SearchPopoverGroup`](SearchPopoverGroup.md)\<`T`\>[]

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L48)

Grouped list of items (mutually exclusive with `items`).

***

### items?

> `optional` **items**: `T`[]

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L46)

Flat list of items (mutually exclusive with `groups`).

***

### onSelect()

> **onSelect**: (`item`) => `void`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L54)

Called when an item is selected.

#### Parameters

##### item

`T`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L60)

Search input placeholder. Defaults to i18n `field.searchOption`.

***

### triggerText

> **triggerText**: `string`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L44)

Text displayed on the trigger button.
