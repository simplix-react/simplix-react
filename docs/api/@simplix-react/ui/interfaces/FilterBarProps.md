[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FilterBarProps

# Interface: FilterBarProps

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:107](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L107)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:138](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L138)

***

### count?

> `optional` **count**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:124](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L124)

When provided, renders a standard total-count badge at the start of the leading group.

***

### filters

> **filters**: [`FilterDef`](../type-aliases/FilterDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:108](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L108)

***

### leading?

> `optional` **leading**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:111](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L111)

Content rendered on the left side of the filter bar.

***

### maxBadges?

> `optional` **maxBadges**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:115](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L115)

Max number of visible filter badges before collapsing into "+N".

***

### onPreview()?

> `optional` **onPreview**: () => `void`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:120](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L120)

When provided, renders a preview button in the leading group that invokes
this handler on click. Omit to hide the button.

#### Returns

`void`

***

### popoverColumns?

> `optional` **popoverColumns**: `1` \| `2` \| `3` \| `"auto"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:137](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L137)

Column layout of the filter popover form.

- `"auto"` (default) — one column; switches to two columns when the form
  overflows its max height (a vertical scrollbar would appear).
- `1` — always a single 320px column.
- `2` — always two columns in a 560px popover.
- `3` — always three columns in an 800px popover.

Column boundaries follow `columnBreak` flags on the filter definitions;
without flags the filters are split evenly.

***

### previewLabel?

> `optional` **previewLabel**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:122](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L122)

Label for the preview button. Defaults to the `list.preview` translation.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:109](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L109)

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L113)

Content rendered on the right side of the filter bar, before the filter/columns group.
