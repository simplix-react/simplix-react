[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TableProps

# Type Alias: TableProps

> **TableProps** = `ComponentPropsWithRef`\<`"table"`\> & `object`

Defined in: [packages/ui/src/base/display/table.tsx:133](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/table.tsx#L133)

## Type Declaration

### density?

> `optional` **density**: `"compact"` \| `"default"` \| `"comfortable"`

### fill?

> `optional` **fill**: `boolean`

Fills a height-bounded flex parent (`flex-1 min-h-0`) instead of using `maxHeight`.

### maxHeight?

> `optional` **maxHeight**: `number` \| `string`

Bounds the scroll container height so the body scrolls vertically. Pair with `stickyHeader`.

### rounded?

> `optional` **rounded**: `"none"` \| `"sm"` \| `"md"` \| `"lg"`

### size?

> `optional` **size**: `"sm"` \| `"md"` \| `"lg"`

### stickyHeader?

> `optional` **stickyHeader**: `boolean`

Sticks the header to the top of the scroll container while the body scrolls.
With `maxHeight`/`fill` the table owns the scroll region and CSS sticky is
used; without them the header follows the nearest scrollable ancestor
(e.g. a page, dialog, or detail-pane body) via a scroll-synced transform,
so the container keeps its own horizontal scrollbar.

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`
