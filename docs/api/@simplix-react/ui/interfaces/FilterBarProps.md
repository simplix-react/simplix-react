[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FilterBarProps

# Interface: FilterBarProps

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:105](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L105)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:136](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L136)

***

### count?

> `optional` **count**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:122](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L122)

When provided, renders a standard total-count badge at the start of the leading group.

***

### filters

> **filters**: [`FilterDef`](../type-aliases/FilterDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:106](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L106)

***

### leading?

> `optional` **leading**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:109](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L109)

Content rendered on the left side of the filter bar.

***

### maxBadges?

> `optional` **maxBadges**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L113)

Max number of visible filter badges before collapsing into "+N".

***

### onPreview()?

> `optional` **onPreview**: () => `void`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:118](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L118)

When provided, renders a preview button in the leading group that invokes
this handler on click. Omit to hide the button.

#### Returns

`void`

***

### popoverColumns?

> `optional` **popoverColumns**: `1` \| `2` \| `3` \| `"auto"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:135](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L135)

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

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:120](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L120)

Label for the preview button. Defaults to the `list.preview` translation.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:107](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L107)

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:111](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L111)

Content rendered on the right side of the filter bar, before the filter/columns group.
