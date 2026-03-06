[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useVirtualList

# Function: useVirtualList()

> **useVirtualList**(`options`): `object`

Defined in: [packages/ui/src/crud/list/use-virtual.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-virtual.ts#L31)

Virtual scrolling hook for large lists, wrapping `@tanstack/react-virtual`.

## Parameters

### options

[`UseVirtualListOptions`](../interfaces/UseVirtualListOptions.md)

[UseVirtualListOptions](../interfaces/UseVirtualListOptions.md)

## Returns

`object`

`virtualizer` instance, `virtualRows` to render, and `totalHeight` for spacer.

### totalHeight

> **totalHeight**: `number`

### virtualizer

> **virtualizer**: `Virtualizer`\<`HTMLElement`, `Element`\>

### virtualRows

> **virtualRows**: `VirtualItem`[]

## Example

```ts
const { virtualRows, totalHeight } = useVirtualList({
  count: items.length,
  estimateSize: () => 48,
  parentRef: scrollRef,
});
```
