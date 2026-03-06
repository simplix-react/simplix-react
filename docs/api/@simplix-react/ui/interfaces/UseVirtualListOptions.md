[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseVirtualListOptions

# Interface: UseVirtualListOptions

Defined in: [packages/ui/src/crud/list/use-virtual.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-virtual.ts#L5)

Options for the [useVirtualList](../functions/useVirtualList.md) hook.

## Properties

### count

> **count**: `number`

Defined in: [packages/ui/src/crud/list/use-virtual.ts:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-virtual.ts#L7)

Total number of items.

***

### estimateSize()

> **estimateSize**: () => `number`

Defined in: [packages/ui/src/crud/list/use-virtual.ts:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-virtual.ts#L9)

Estimated height (px) per row for initial layout.

#### Returns

`number`

***

### overscan?

> `optional` **overscan**: `number`

Defined in: [packages/ui/src/crud/list/use-virtual.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-virtual.ts#L13)

Number of extra rows to render outside the viewport. Defaults to `5`.

***

### parentRef

> **parentRef**: `RefObject`\<`HTMLElement` \| `null`\>

Defined in: [packages/ui/src/crud/list/use-virtual.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-virtual.ts#L11)

Ref to the scrollable parent container.
